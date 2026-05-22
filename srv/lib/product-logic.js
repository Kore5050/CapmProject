'use strict'

const cds = require('@sap/cds')
const ALLOWED_CATEGORIES = ['Electronics', 'Furniture', 'Stationery']

function trimString(value) {
  return typeof value === 'string' ? value.trim() : value
}

function validateProduct(data, { isUpdate = false } = {}) {
  const errors = []

  if (!isUpdate || data.title !== undefined) {
    const title = trimString(data.title)
    if (!title || title.length < 2) errors.push('title must be at least 2 characters')
  }

  if (!isUpdate || data.category !== undefined) {
    const category = trimString(data.category)
    if (!category) errors.push('category is required')
    else if (!ALLOWED_CATEGORIES.includes(category)) {
      errors.push(`category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`)
    }
  }

  if (!isUpdate || data.price !== undefined) {
    const price = Number(data.price)
    if (!Number.isFinite(price) || price <= 0) errors.push('price must be a positive number')
  }

  if (!isUpdate || data.stock !== undefined) {
    const stock = Number(data.stock)
    if (!Number.isInteger(stock) || stock < 0) errors.push('stock must be a non-negative integer')
  }

  return errors
}

function normalizeProduct(data) {
  const normalized = { ...data }
  if (normalized.title !== undefined) normalized.title = trimString(normalized.title)
  if (normalized.category !== undefined) normalized.category = trimString(normalized.category)
  if (normalized.price !== undefined) normalized.price = Number(normalized.price)
  if (normalized.stock !== undefined) normalized.stock = Number(normalized.stock)
  return normalized
}

async function nextProductId(tx) {
  const { SELECT } = cds.ql
  const rows = await tx.run(SELECT.from('my.catalog.Products').columns('ID'))
  const maxId = rows.reduce((max, row) => Math.max(max, row.ID), 0)
  return maxId + 1
}

module.exports = {
  ALLOWED_CATEGORIES,
  validateProduct,
  normalizeProduct,
  nextProductId,
}
