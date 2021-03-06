customProperties:"formComponent:false",
dataSource:"db:/example_data/order_details",
extendsID:"219856F0-4247-4B28-99EE-6F7E9FFCDAA1",
items:[
{
horizontalAlignment:4,
labelFor:"subtotal",
location:"646,2",
name:"subtotal_label",
size:"80,30",
text:"Subtotal",
typeid:7,
uuid:"0287AED4-F2B6-4B07-9C49-763A7360F467"
},
{
labelFor:"productid",
location:"19,2",
name:"productid_label",
size:"80,30",
text:"Product",
typeid:7,
uuid:"2ADB2C4A-E93D-42EA-B6C8-A327F3C1873C"
},
{
height:68,
partType:5,
typeid:19,
uuid:"57B3C7BA-0051-4707-9A4F-039AD7A232AF"
},
{
dataProviderID:"productid",
displayType:10,
editable:false,
enabled:false,
location:"7,37",
name:"productid",
size:"254,30",
typeid:4,
uuid:"75C9CDB4-C284-4AC9-A2E7-82AE1C704DF0",
valuelistID:"D85AC2BB-A230-4D87-9B6F-E771351922A9"
},
{
dataProviderID:"unitprice",
format:"¤#.00",
horizontalAlignment:4,
location:"396,37",
name:"unitprice",
size:"113,30",
transparent:true,
typeid:4,
uuid:"8536FFDC-A40D-441E-A64B-8DDCF359165E"
},
{
dataProviderID:"subtotal",
editable:false,
enabled:false,
format:"¤#.00",
horizontalAlignment:4,
location:"646,37",
name:"subtotal",
size:"144,30",
typeid:4,
uuid:"9AAFDB32-8B7A-44F3-8435-82299CD87036"
},
{
horizontalAlignment:4,
labelFor:"discount",
location:"521,2",
name:"discount_label",
size:"80,30",
text:"Discount",
typeid:7,
uuid:"A9D34AED-1F51-4587-B7B8-62EAC30A5597"
},
{
displaysTags:true,
location:"14,79",
name:"lblDetailsCount",
size:"310,20",
text:"Number of detail lines: %%maxRecordIndex%%",
typeid:7,
uuid:"C75C4531-3679-4219-B049-7E9C9E8E19F1"
},
{
dataProviderID:"quantity",
horizontalAlignment:4,
location:"271,37",
name:"quantity",
size:"118,30",
transparent:true,
typeid:4,
uuid:"C88686DD-604A-4CB7-97B2-832890AB9337"
},
{
horizontalAlignment:4,
labelFor:"unitprice",
location:"396,2",
name:"unitprice_label",
size:"80,30",
text:"Price",
typeid:7,
uuid:"D618D0A1-38CD-470C-9415-554D9DF40FA8"
},
{
labelFor:"quantity",
location:"271,2",
name:"quantity_label",
size:"80,30",
text:"Quantity",
typeid:7,
uuid:"D7E62E2F-26AA-407B-B285-C2BB49FF68DF"
},
{
height:110,
partType:8,
typeid:19,
uuid:"E32E28AD-FC11-482C-B7BC-25558397F08A"
},
{
dataProviderID:"discount",
format:"#.##%|#.###",
horizontalAlignment:4,
location:"521,37",
name:"discount",
size:"106,30",
transparent:true,
typeid:4,
uuid:"F696B89D-57FE-40B6-9067-6D9408880510"
}
],
name:"orderDetailsEditGrid",
size:"803,110",
typeid:3,
uuid:"77F9DAAA-AB22-46D0-8CB3-FF13FC51F7D2",
view:3