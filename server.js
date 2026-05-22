'use strict'

require('./scripts/ensure-native.js')

function silenceStdoutLogs() {
  const toStderr = (...args) => console.error(...args)
  console.log = toStderr
  console.info = toStderr
}

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const z = require('zod')
const cds = require('@sap/cds')
const { SELECT } = cds.ql
const { ALLOWED_CATEGORIES } = require('./srv/lib/product-logic')

const ENTITY = 'Products'

let catalogReady

async function getCatalog() {
  if (!catalogReady) {
    catalogReady = (async () => {
      silenceStdoutLogs()
      await cds.connect.to('db')
      await cds.deploy('*').to('db')
      return cds.connect.to('CatalogService')
    })()
  }
  return catalogReady
}

function textResult(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  }
}

function errorResult(message) {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  }
}

function capError(err) {
  const msg = err?.message || err?.reason?.message || String(err)
  return errorResult(msg)
}

function runTool(handler) {
  return async (args) => {
    try {
      return await handler(args ?? {})
    } catch (err) {
      return capError(err)
    }
  }
}

async function main() {
  const categories = ALLOWED_CATEGORIES.join(', ')

  const server = new McpServer(
    { name: 'capm-catalog', version: '1.0.0' },
    {
      instructions:
        `SAP CAP CatalogService MCP server. CRUD uses custom handlers in catalog-service.js. Allowed categories: ${categories}.`,
    }
  )

  server.registerResource(
    'products-catalog',
    'cap://products',
    {
      title: 'Product catalog',
      description: 'Full product list as JSON',
      mimeType: 'application/json',
    },
    runTool(async () => {
      const svc = await getCatalog()
      const products = await svc.run(SELECT.from(ENTITY).orderBy('ID'))
      return {
        contents: [
          {
            uri: 'cap://products',
            mimeType: 'application/json',
            text: JSON.stringify(products, null, 2),
          },
        ],
      }
    })
  )

  server.registerTool(
    'list_products',
    {
      title: 'List products',
      description: 'List all products, optionally filtered by category.',
      inputSchema: z.object({
        category: z.string().optional().describe(`Filter by category (${categories})`),
      }),
      annotations: { readOnlyHint: true },
    },
    runTool(async ({ category }) => {
      const svc = await getCatalog()
      let query = SELECT.from(ENTITY).orderBy('ID')
      if (category) query = query.where({ category })
      const products = await svc.run(query)
      return textResult({ count: products.length, products })
    })
  )

  server.registerTool(
    'get_product',
    {
      title: 'Get product',
      description: 'Get a single product by ID.',
      inputSchema: z.object({
        id: z.coerce.number().int().positive().describe('Product ID'),
      }),
      annotations: { readOnlyHint: true },
    },
    runTool(async ({ id }) => {
      const svc = await getCatalog()
      const product = await svc.run(SELECT.one.from(ENTITY).where({ ID: id }))
      if (!product) return errorResult(`Product ${id} not found`)
      return textResult(product)
    })
  )

  server.registerTool(
    'search_products',
    {
      title: 'Search products',
      description: 'Search products by title (case-insensitive substring).',
      inputSchema: z.object({
        query: z.coerce.string().min(1).describe('Text to search in product title'),
      }),
      annotations: { readOnlyHint: true },
    },
    runTool(async ({ query }) => {
      const svc = await getCatalog()
      const products = await svc.run(
        SELECT.from(ENTITY).where`lower(title) like ${'%' + query.toLowerCase() + '%'}`.orderBy('ID')
      )
      return textResult({ count: products.length, products })
    })
  )

  server.registerTool(
    'create_product',
    {
      title: 'Create product',
      description: `Create product (validated by catalog-service.js). Categories: ${categories}`,
      inputSchema: z.object({
        title: z.coerce.string().min(1),
        price: z.coerce.number().positive(),
        stock: z.coerce.number().int().nonnegative(),
        category: z.coerce.string().min(1),
        id: z.coerce.number().int().positive().optional().describe('Optional ID; auto-assigned if omitted'),
      }),
      annotations: { destructiveHint: false },
    },
    runTool(async ({ title, price, stock, category, id }) => {
      const svc = await getCatalog()
      const payload = { title, price, stock, category }
      if (id !== undefined) payload.ID = id
      const created = await svc.create(ENTITY, payload)
      return textResult({ created })
    })
  )

  server.registerTool(
    'update_product',
    {
      title: 'Update product',
      description: `Update product (validated by catalog-service.js). Categories: ${categories}`,
      inputSchema: z.object({
        id: z.coerce.number().int().positive(),
        title: z.coerce.string().min(1).optional(),
        price: z.coerce.number().positive().optional(),
        stock: z.coerce.number().int().nonnegative().optional(),
        category: z.coerce.string().min(1).optional(),
      }),
    },
    runTool(async ({ id, title, price, stock, category }) => {
      const payload = { ID: id }
      if (title !== undefined) payload.title = title
      if (price !== undefined) payload.price = price
      if (stock !== undefined) payload.stock = stock
      if (category !== undefined) payload.category = category

      if (Object.keys(payload).length === 1) {
        return errorResult('Provide at least one field to update (title, price, stock, or category)')
      }

      const svc = await getCatalog()
      const updated = await svc.update(ENTITY, payload)
      return textResult({ updated })
    })
  )

  server.registerTool(
    'delete_product',
    {
      title: 'Delete product',
      description: 'Delete a product by ID (validated by catalog-service.js).',
      inputSchema: z.object({
        id: z.coerce.number().int().positive().describe('Product ID to delete'),
      }),
      annotations: { destructiveHint: true },
    },
    runTool(async ({ id }) => {
      const svc = await getCatalog()
      await svc.delete(ENTITY, id)
      return textResult({ deleted: { ID: id } })
    })
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error('MCP server failed:', err)
  process.exit(1)
})
