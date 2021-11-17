using Bernstein.IRS.Beehive.Api.Utility;
using Bernstein.IRS.Beehive.Models;
using Bernstein.IRS.Utility;
using Bernstein.IRS.Data;
using Newtonsoft.Json;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using Newtonsoft.Json.Linq;

namespace Bernstein.IRS.Beehive.Api.Controller
{
    public class ProductGroupsController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("BehiveServiceLog");

        // GET: api/ProductGroups
        [ActionName("ProductGroups")]
        public IHttpActionResult Get()
        {
            DataTable dtProductGroups = new DataTable();
            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                DataSet ds = dh.ExecuteDataSet("spApiGetProductGroups", CommandType.StoredProcedure);
                dtProductGroups = ds.Tables[0];
            }
            var ProductGroups = Newtonsoft.Json.JsonConvert.DeserializeObject(dtProductGroups.DataTableToJson());
            return this.Ok(ProductGroups);
        }

        // GET: api/ProductGroups/5
        [ResponseType(typeof(ProductGroupModel))]
        public IHttpActionResult Get(int id)
        {
            ProductGroupModel ProductGroup = ProductGroupData(id);
            return this.Ok(ProductGroup);
        }

        private ProductGroupModel ProductGroupData(int id)
        {
            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                SqlParameter[] sqlParams = new SqlParameter[1];
                sqlParams[0] = new SqlParameter("@ProductGroupId", id);
                DataSet dsProductGroups = dh.ExecuteDataSet("spApiGetProductGroup", CommandType.StoredProcedure, sqlParams);
                ProductGroupModel ProductGroup = new ProductGroupModel
                {
                    Name = dsProductGroups.Tables[0].AsEnumerable().Select(row => row.Field<string>("ProductGroupName")).ToList().FirstOrDefault(),
                    Description = dsProductGroups.Tables[0].AsEnumerable().Select(row => row.Field<string>("ProductGroupDescription")).ToList().FirstOrDefault(),
                    Types = FetchList(dsProductGroups.Tables[1]),
                    Industries = FetchList(dsProductGroups.Tables[2]),
                    Analysts = FetchList(dsProductGroups.Tables[3]),
                    Tickers = FetchList(dsProductGroups.Tables[4]),
                    StartDate = dsProductGroups.Tables[5].AsEnumerable().Select(row => row.Field<string>("StartDate")).ToList().Count > 0 ?
                                dsProductGroups.Tables[5].AsEnumerable().Select(row => row.Field<string>("StartDate")).ToList().FirstOrDefault() : string.Empty,
                    EndDate = dsProductGroups.Tables[6].AsEnumerable().Select(row => row.Field<string>("EndDate")).ToList().Count > 0 ?
                                dsProductGroups.Tables[6].AsEnumerable().Select(row => row.Field<string>("EndDate")).ToList().FirstOrDefault() : string.Empty,
                    Id = id
                };
                return ProductGroup;
            }
        }

        // POST: api/ProductGroups
        public IHttpActionResult Post([FromBody] ProductGroupModel value)
        {
            List<ProductGroupsLog> productGroupsLog = new List<ProductGroupsLog>();
            ProductGroupDelta(ProductGroupFieldTypes.Type, value.Types ?? new List<ItemsList>()).ForEach((Types) =>
            {
                productGroupsLog.Add(Types);
            });
            ProductGroupDelta(ProductGroupFieldTypes.Industry, value.Industries ?? new List<ItemsList>()).ForEach((Industry) =>
            {
                productGroupsLog.Add(Industry);
            });
            ProductGroupDelta(ProductGroupFieldTypes.Analyst, value.Analysts ?? new List<ItemsList>()).ForEach((Analyst) =>
            {
                productGroupsLog.Add(Analyst);
            });
            ProductGroupDelta(ProductGroupFieldTypes.Ticker, value.Tickers ?? new List<ItemsList>()).ForEach((Ticker) =>
            {
                productGroupsLog.Add(Ticker);
            });
            ProductGroupsDelta productGroupData = new ProductGroupsDelta
            {
                Delta = productGroupsLog
            };
            var result = DBUpdate(-1, JsonConvert.SerializeObject(value), JsonConvert.SerializeObject(productGroupData));
            return this.Ok(result);
        }

        // PUT: api/ProductGroups/5
        public IHttpActionResult Put(int id, [FromBody] ProductGroupModel value)
        {
            ProductGroupModel ProductGroup = ProductGroupData(id);
            string loggedtext = string.Empty;
            if (ProductGroup.Name != value.Name)
            {
                loggedtext += "Product Group Name modified. Earlier was " + ProductGroup.Name + " Currently is " + value.Name + ";";
            }
            if (ProductGroup.Description != value.Description)
            {
                loggedtext += " Product Group Description modified. Earlier was " + ProductGroup.Description + " Currently is " + value.Description + ";";
            }
            if (ProductGroup.StartDate != value.StartDate)
            {
                loggedtext += " Start Date modified. Earlier was " + ProductGroup.StartDate + " Currently is " + value.StartDate + ";";
            }
            if (ProductGroup.EndDate != value.EndDate)
            {
                loggedtext += " End Date modified. Earlier was " + ProductGroup.EndDate + " Currently is " + value.EndDate + ";";
            }
            List<ProductGroupsLog> productGroupsLog = new List<ProductGroupsLog>();
            ProductGroupDelta(ProductGroupFieldTypes.Type, value.Types ?? new List<ItemsList>(), ProductGroup.Types).ForEach((Types) =>
            {
                productGroupsLog.Add(Types);
            });
            ProductGroupDelta(ProductGroupFieldTypes.Industry, value.Industries ?? new List<ItemsList>(), ProductGroup.Industries).ForEach((Industry) =>
            {
                productGroupsLog.Add(Industry);
            });
            ProductGroupDelta(ProductGroupFieldTypes.Analyst, value.Analysts ?? new List<ItemsList>(), ProductGroup.Analysts).ForEach((Analyst) =>
            {
                productGroupsLog.Add(Analyst);
            });
            ProductGroupDelta(ProductGroupFieldTypes.Ticker, value.Tickers ?? new List<ItemsList>(), ProductGroup.Tickers).ForEach((Ticker) =>
            {
                productGroupsLog.Add(Ticker);
            });
            ProductGroupsDelta productGroupData = new ProductGroupsDelta
            {
                Delta = productGroupsLog
            };
            var result = DBUpdate(id, JsonConvert.SerializeObject(value), JsonConvert.SerializeObject(productGroupData));
            return this.Ok(result);
        }

        private List<ProductGroupsLog> ProductGroupDelta(ProductGroupFieldTypes type, List<ItemsList> CurrentList, List<ItemsList> PreviousList = null)
        {
            int EditorID = Convert.ToInt32(Request.Headers.GetCookies().Select(name => name.Cookies).First().FirstOrDefault(name => name.Name == "UserID").Value);
            if (PreviousList == null)
            {
                return (from types in CurrentList
                        select new ProductGroupsLog()
                        {
                            EditorId = EditorID,
                            Action = Enum.GetName(typeof(ProductGroupActionTypes), ProductGroupActionTypes.Created),
                            ItemTypeId = (int)type,
                            ItemId = types.Value
                        }).ToList();
            }
            else
            {
                Dictionary<int, bool> PreviousListDictionary = new Dictionary<int, bool>();
                Dictionary<int, bool> CurrentListDictionary = new Dictionary<int, bool>();
                string text = string.Empty;
                foreach (var rowObject in PreviousList.Cast<object>().Select((r, i) => new { Row = r, Index = i }))
                {
                    var row = rowObject.Row;
                    var i = rowObject.Index;
                    PreviousListDictionary.Add(((Bernstein.IRS.Beehive.Models.ItemsList)rowObject.Row).Value, false);
                }
                foreach (var rowObject in CurrentList.Cast<object>().Select((r, i) => new { Row = r, Index = i }))
                {
                    var row = rowObject.Row;
                    var i = rowObject.Index;
                    CurrentListDictionary.Add(((Bernstein.IRS.Beehive.Models.ItemsList)rowObject.Row).Value, false);
                }
                bool dicVal = false;

                Dictionary<int, bool> CurrentListDictionaryCopy = new Dictionary<int, bool>(CurrentListDictionary);
                foreach (var item in CurrentListDictionary)
                {
                    if (PreviousListDictionary.TryGetValue(item.Key, out dicVal))
                    {
                        PreviousListDictionary[item.Key] = true;
                        CurrentListDictionaryCopy[item.Key] = true;
                    }
                }

                return ((from types in PreviousList
                         join items in PreviousListDictionary.Where((x) => x.Value == false).Select((x) => x.Key).ToList()
                         on types.Value equals items
                         select new ProductGroupsLog()
                         {
                             EditorId = EditorID,
                             Action = Enum.GetName(typeof(ProductGroupActionTypes), ProductGroupActionTypes.Deleted),
                             ItemTypeId = (int)type,
                             ItemId = types.Value
                         }).Union(
                            from types in CurrentList
                            join items in CurrentListDictionaryCopy.Where((x) => x.Value == false).Select((x) => x.Key).ToList()
                            on types.Value equals items
                            select new ProductGroupsLog()
                            {
                                EditorId = EditorID,
                                Action = Enum.GetName(typeof(ProductGroupActionTypes), ProductGroupActionTypes.Added),
                                ItemTypeId = (int)type,
                                ItemId = types.Value
                            })).ToList();
            }
        }

        // DELETE: api/ProductGroups/5
        public void Delete(int id)
        {
        }

        private HttpResponseMessage DBUpdate(int id, string content, string logText = "")
        {
            dynamic data = JsonConvert.DeserializeObject(content);
            string ProductGroupName = data.Name.ToString();
            var response = new HttpResponseMessage();

            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                SqlParameter[] sqlParams = new SqlParameter[3];
                Array.Clear(sqlParams, 0, sqlParams.Length);
                sqlParams[0] = new SqlParameter("@ProductGroupId", id);
                sqlParams[1] = new SqlParameter("@productGroupJSON", content);
                sqlParams[2] = new SqlParameter("@productGroupDELTA", logText);

                if (id == -1)
                {
                    int ProductGroupID = Convert.ToInt32(dh.ExecuteDataSet("spApiSaveProductGroup", CommandType.StoredProcedure, sqlParams).Tables[0].Rows[0][0]);
                    response.ReasonPhrase = "Product Group : " + ProductGroupName + " Created Sucessfully with ID : " + ProductGroupID;
                    response.StatusCode = HttpStatusCode.Created;
                }
                else
                {
                    int result = dh.ExecuteNonQuery("spApiSaveProductGroup", CommandType.StoredProcedure, sqlParams);
                    response.ReasonPhrase = "Product Group : " + ProductGroupName + " Updated Sucessfully";
                    response.StatusCode = HttpStatusCode.OK;
                }
            }
            return response;
        }

        private List<ItemsList> FetchList(DataTable dt)
        {
            var convertedList = (from rw in dt.AsEnumerable()
                                 select new ItemsList()
                                 {
                                     Value = Convert.ToInt32(rw["Value"]),
                                     Display = Convert.ToString(rw["Display"])
                                 }).ToList();
            return convertedList;
        }

        [Route("api/productgroups/delta/")]
        [HttpGet]
        public IHttpActionResult ProductGroupsDelta(string productGroupId)
        {
            DataTable dtSearchResult = new DataTable();
            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                SqlParameter[] sqlParams = new SqlParameter[1];
                sqlParams[0] = new SqlParameter("@ProductGroupId", productGroupId ?? string.Empty);
                dtSearchResult = dh.ExecuteDataTable("spApiGetProductGroupsLog", CommandType.StoredProcedure, sqlParams);
            }
            var ProductGroups = JsonConvert.DeserializeObject(dtSearchResult.DataTableToJson());
            return this.Ok(ProductGroups);
        }
    }
}
