'use strict'

const cds = require('@sap/cds')
const { validateProduct, normalizeProduct, nextProductId } = require('./lib/product-logic')

function getProductId(req) {
  if (req.data?.ID != null) return req.data.ID
  const key = req.params?.[0]
  if (key && typeof key === 'object' && key.ID != null) return key.ID
  if (typeof key === 'number' || typeof key === 'string') return Number(key)
  return undefined
}

module.exports = cds.service.impl(async function () {
  const { Products } = this.entities

  // Assign ID when a new draft is created (Create button in list report)
  this.before('NEW', Products.drafts, async (req) => {
    if (!req.data.ID) {
      req.data.ID = await nextProductId(cds.transaction(req))
    }
  })

  // Validate before draft activation (Save on object page)
  this.before('SAVE', Products.drafts, (req) => {
    const data = normalizeProduct(req.data)
    const errors = validateProduct(data)
    if (errors.length) return req.error(400, errors.join('; '))
    req.data = data
  })

  this.before('CREATE', Products, async (req) => {
    const data = normalizeProduct(req.data)
    const errors = validateProduct(data)
    if (errors.length) return req.error(400, errors.join('; '))

    if (!data.ID) {
      data.ID = await nextProductId(cds.transaction(req))
    } else if (!Number.isInteger(data.ID) || data.ID <= 0) {
      return req.error(400, 'ID must be a positive integer')
    }

    const { SELECT } = cds.ql
    const existing = await cds.transaction(req).run(
      SELECT.one.from('my.catalog.Products').where({ ID: data.ID })
    )
    if (existing) return req.error(409, `Product ${data.ID} already exists`)

    req.data = data
  })

  this.before('UPDATE', Products, async (req) => {
    const id = getProductId(req)
    if (!id) return req.error(400, 'Product ID is required for update')

    const data = normalizeProduct(req.data)
    const errors = validateProduct(data, { isUpdate: true })
    if (errors.length) return req.error(400, errors.join('; '))

    const { SELECT } = cds.ql
    const existing = await cds.transaction(req).run(
      SELECT.one.from('my.catalog.Products').where({ ID: id })
    )
    if (!existing) return req.error(404, `Product ${id} not found`)

    req.data = { ...data, ID: id }
  })

  this.before('DELETE', Products, async (req) => {
    const id = getProductId(req)
    if (!id) return req.error(400, 'Product ID is required for delete')

    const { SELECT } = cds.ql
    const existing = await cds.transaction(req).run(
      SELECT.one.from('my.catalog.Products').where({ ID: id })
    )
    if (!existing) return req.error(404, `Product ${id} not found`)

    req.data = { ID: id }
  })

  this.after('CREATE', Products, (data) => {
    console.error(`[CatalogService] Created product ${data.ID}: ${data.title}`)
  })

  this.after('UPDATE', Products, (data) => {
    console.error(`[CatalogService] Updated product ${data.ID}: ${data.title}`)
  })

  this.after('DELETE', Products, (_, req) => {
    console.error(`[CatalogService] Deleted product ${getProductId(req)}`)
  })
})
