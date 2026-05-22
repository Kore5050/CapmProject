using { my.catalog as my } from '../db/schema';

service CatalogService {
    // Draft support — required for Fiori Elements Create / Edit flow
    @odata.draft.enabled
    entity Products as projection on my.Products;
}

// -------------------------------------------------------------------------
// Capabilities + explicit UI visibility for Create / Edit / Delete buttons
// -------------------------------------------------------------------------
annotate CatalogService.Products with @(
    Capabilities : {
        InsertRestrictions : { Insertable : true },
        UpdateRestrictions : { Updatable : true },
        DeleteRestrictions : { Deletable : true }
    },

    UI.CreateHidden : false,
    UI.UpdateHidden : false,
    UI.DeleteHidden : false,

    // List report table columns
    UI.LineItem : [
        { Value : ID, Label : 'Product ID' },
        { Value : title, Label : 'Product Name' },
        { Value : category, Label : 'Category' },
        { Value : price, Label : 'Price' },
        { Value : stock, Label : 'Stock Available' }
    ],

    UI.SelectionFields : [
        title,
        category
    ],

    UI.HeaderInfo : {
        TypeName       : 'Product',
        TypeNamePlural : 'Products',
        Title          : { Value : title },
        Description    : { Value : category }
    },

    // Object page layout — enables Edit on row drill-down
    UI.Identification : [
        { Value : title, Label : 'Product Name' }
    ],

    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'GeneralInformation',
            Label  : 'General Information',
            Target : '@UI.FieldGroup#General'
        }
    ],

    UI.FieldGroup #General : {
        Label : 'Product Details',
        Data  : [
            { Value : title, Label : 'Product Name' },
            { Value : category, Label : 'Category' },
            { Value : price, Label : 'Price' },
            { Value : stock, Label : 'Stock Available' }
        ]
    }
);
