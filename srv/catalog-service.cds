using { my.catalog as my } from '../db/schema';

service CatalogService {
    entity Products as projection on my.Products;
}

// -------------------------------------------------------------------------
// UI Annotations for Fiori Elements Frontend Layout
// -------------------------------------------------------------------------

annotate CatalogService.Products with @(
    // 1. This controls the columns displayed inside the main table grid
    UI.LineItem : [
        { Value : ID, Label : 'Product ID' },
        { Value : title, Label : 'Product Name' },
        { Value : category, Label : 'Category' },
        { Value : price, Label : 'Price' },
        { Value : stock, Label : 'Stock Available' }
    ],

    // 2. This controls the selection filters at the very top of the page
    UI.SelectionFields : [
        title,
        category
    ],

    // 3. This controls the header title when opening a specific item detail page
    UI.HeaderInfo : {
        TypeName       : 'Product',
        TypeNamePlural : 'Products',
        Title          : { Value : title },
        Description    : { Value : category }
    }
);