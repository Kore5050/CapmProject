namespace my.catalog;

entity Products {
    key ID   : Integer @cds.autoincrement; // Yeh line automatic 1, 2, 3, 4 number generate karegi!
    title    : String;
    price    : Decimal;
    stock    : Integer;
    category : String;
}