#installer

wrap npm & git to install things for testing

***important: installing the product code so that it will not use any deps of the testing code.***

it must be installed beside the test repo, not within it

yes:

node_modules/tests
node_modules/product

not:

node_modules/tests
node_modules/tests/node_modules/product

the tests will still see the product code, but the product code will not see the test's deps.

WRITE A TEST FOR THAT!