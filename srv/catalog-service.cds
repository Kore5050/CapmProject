using { my.catalog as catalog } from '../db/schema';

service CatalogService {
    entity Products as projection on catalog.Products;
}

annotate CatalogService.Products with @(
    UI: {
        HeaderInfo: {
            TypeName: 'Product',
            TypeNamePlural: 'Products',
            Title: { Value: title }
        },
        SelectionFields: [
            title,
            category,
            price
        ],
        LineItem: [
            { Value: ID, Label: 'ID' },
            { Value: title, Label: 'Title' },
            { Value: price, Label: 'Price' },
            { Value: stock, Label: 'Stock' },
            { Value: category, Label: 'Category' }
        ]
    }
);

annotate CatalogService.Products with {
    ID       @title: 'ID';
    title    @title: 'Title';
    price    @title: 'Price';
    stock    @title: 'Stock';
    category @title: 'Category';
};
