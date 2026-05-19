namespace my.catalog;

entity Products {
    key ID : Integer;
    title  : String;
    price  : Decimal;
    stock  : Integer;
    category : String;
}