using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using Bernstein.IRS.Beehive.Api.Utility;
using Bernstein.IRS.Beehive.Models;
using Bernstein.IRS.Data;
using Bernstein.IRS.ElasticModels;
using Bernstein.IRS.Utility;
using DocumentFormat.OpenXml.Office2010.PowerPoint;
using Newtonsoft.Json;
using NLog;

namespace Bernstein.IRS.Web.Controllers
{
    public class AssetsController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("BehiveServiceLog");

        public AssetsController()
        {

        }

        [Route("api/Assets/GetAssets/")]
        public IHttpActionResult GetAssets(int userId)
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                string company = string.Empty;
                DataTable dtResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@UserId", userId);
                    dtResult = dh.ExecuteDataTable("spApiGetAssets", CommandType.StoredProcedure, sqlParams);
                    EncryptURL encryptURL = new EncryptURL();
                    foreach (DataRow row in dtResult.Rows)
                    {
                        string DecksPayload = ConfigurationManager.AppSettings["Assets.Payload"].ToString().Trim().Replace("-", row["LinkId"].ToString());
                        String[] DecksPayloadList = new String[7];
                        DecksPayloadList = DecksPayload.Split(',');
                        string encryptedText = encryptURL.EncryptPayload(DecksPayloadList[0], DecksPayloadList[1], DecksPayloadList[2], DecksPayloadList[3], DecksPayloadList[4], DecksPayloadList[5]);
                        string CID = ConfigurationManager.AppSettings["Assets.Url"].ToString().Trim() + encryptedText;
                        row.SetField(dtResult.Columns.Cast<DataColumn>().Single(column => column.Ordinal == 15), CID);
                    }
                }
                var assets = Newtonsoft.Json.JsonConvert.DeserializeObject(dtResult.DataTableToJson());
                logger.Info("spApiGetAssets request end by {0}", ip);
                return this.Ok(assets);
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetAssets message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        [Route("api/Assets/GetAssetTypes/")]
        [HttpGet]
        public IHttpActionResult GetAssetTypes()
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                string company = string.Empty;
                DataTable dtResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    dtResult = dh.ExecuteDataTable("spApiGetAssetTypes", CommandType.StoredProcedure);
                }
                var assetTypes = Newtonsoft.Json.JsonConvert.DeserializeObject(dtResult.DataTableToJson());
                logger.Info("spApiGetAssetTypes request end by {0}", ip);
                return this.Ok(assetTypes);
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetAssets message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        [Route("api/Assets/GetAssetOwners/")]
        [HttpGet]
        public IHttpActionResult GetAssetOwners(int userId)
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                string company = string.Empty;
                DataTable dtResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@UserId", userId);
                    DataSet ds = dh.ExecuteDataSet("spApiGetAssetOwners", CommandType.StoredProcedure, sqlParams);
                    var analysts = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[0].DataTableToJson());
                    var industries = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[1].DataTableToJson());
                    var tickers = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[2].DataTableToJson());
                    logger.Info("spApiGetAssetTypes request end by {0}", ip);
                    return this.Ok(
                        new
                        {
                            Analysts = analysts,
                            Industries = industries,
                            Tickers = tickers
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetAssets message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        [Route("api/Assets/expireAsset/")]
        [HttpDelete]
        public string ExpireAsset(int assetId, int userId)
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {

                    SqlParameter[] sqlParams = new SqlParameter[2];
                    sqlParams[0] = new SqlParameter("@AssetId", assetId);
                    sqlParams[1] = new SqlParameter("@UserId", userId);
                    int result = dh.ExecuteNonQuery("spApiExpireAsset", CommandType.StoredProcedure, sqlParams);
                }
                return "Content expired";
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiExpireAsset message:{0}", ex.Message);
                return "Deck ID " + assetId.ToString() + " Couldn't be Expired !";
            }
        }

        [Route("api/Assets/GetAsset/")]
        [HttpGet]
        public IHttpActionResult GetAsset(int assetId)
        {
            try
            {
                AssetsForm AssetData = AssetsFormData(assetId);
                return this.Ok(AssetData);
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetAsset message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        [Route("api/Assets/DownloadAsset/")]
        [HttpGet]
        public HttpResponseMessage DownloadAsset(int AssetId, int AssetTypeID)
        {
            //Create HTTP Response.
            HttpResponseMessage response = null;
            string filepath = string.Empty;
            try
            {
                Impersonation.Impersonate();
                string FileExtension = string.Empty;
                string MediaTypeHeaderValue = string.Empty;
                if (AssetTypeID == 1)
                {
                    FileExtension = ".PDF";
                    MediaTypeHeaderValue = "application/pdf";
                }
                else if (AssetTypeID == 2)
                {
                    FileExtension = ".XLSX";
                    MediaTypeHeaderValue = "application/octet-stream";
                }
                filepath = ConfigurationManager.AppSettings["Assets.Path"].ToString().Trim() + AssetId + FileExtension;
                if (filepath != string.Empty)
                {
                    var fileLength = new FileInfo(filepath).Length;
                    double fileSizeKB = fileLength / 1024;
                    if (fileSizeKB > 3)
                    {
                        if (!File.Exists(filepath))
                            throw new HttpResponseException(HttpStatusCode.NotFound);
                        FileStream fileStream = new FileStream(filepath, FileMode.Open);

                        response = new HttpResponseMessage { Content = new StreamContent(fileStream) };
                        response.Content.Headers.ContentType = new MediaTypeHeaderValue(MediaTypeHeaderValue);
                        FileInfo f = new FileInfo(filepath);
                        long s1 = f.Length;
                        response.Content.Headers.ContentLength = s1;
                    }
                    return response;
                }
                Impersonation.Revert();
            }
            catch (Exception ex)
            {
                logger.Error("Exception at download image:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ex.Message);
            }
            finally
            {

            }
            return response;
        }

        [Route("api/Assets/GetAssetHistory/")]
        [HttpGet]
        public IHttpActionResult GetAssetHistory(int linkId)
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                string company = string.Empty;
                DataTable dtResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@LinkId", linkId);
                    dtResult = dh.ExecuteDataTable("spApiGetAssetHistory", CommandType.StoredProcedure, sqlParams);
                }
                var assetHistory = Newtonsoft.Json.JsonConvert.DeserializeObject(dtResult.DataTableToJson());
                logger.Info("spApiGetAssetHistory request end by {0}", ip);
                return this.Ok(assetHistory);
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetAssetHistory message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        [Route("api/Assets/SaveAsset")]
        [HttpPost]
        public HttpResponseMessage UploadAsset()
        {
            string ip = Request.GetClientIpAddress();
            HttpResponseMessage result;
            try
            {
                var httpRequest = HttpContext.Current.Request;
                AssetsForm assetsForm = new AssetsForm();
                assetsForm.AssetId = Convert.ToInt32(HttpContext.Current.Request.Params["AssetId"]);
                assetsForm.LinkId = Convert.ToInt32(HttpContext.Current.Request.Params["LinkId"]);
                assetsForm.AnalystId = Convert.ToInt32(HttpContext.Current.Request.Params["AnalystId"]);
                assetsForm.AssetTypeId = Convert.ToInt32(HttpContext.Current.Request.Params["AssetTypeId"]);
                assetsForm.Title = HttpContext.Current.Request.Params["Title"];
                assetsForm.FileName = HttpContext.Current.Request.Params["FileName"];
                assetsForm.FileNameOrig = HttpContext.Current.Request.Params["FileNameOrig"];
                assetsForm.FileSize = Convert.ToInt64(HttpContext.Current.Request.Params["FileSize"]);
                assetsForm.CreatedById = Convert.ToInt32(HttpContext.Current.Request.Params["CreatedById"]);

                assetsForm.Industries = JsonConvert.DeserializeObject<List<ItemsList>>(HttpContext.Current.Request.Params["Industries"]);

                assetsForm.Tickers = JsonConvert.DeserializeObject<List<ItemsList>>(HttpContext.Current.Request.Params["Tickers"]);

                assetsForm.Analysts = JsonConvert.DeserializeObject<List<ItemsList>>(HttpContext.Current.Request.Params["Analysts"]);

                assetsForm.ExpiryDate = Convert.ToString(HttpContext.Current.Request.Params["ExpiryDate"]).Replace('-', '/');

                string fileExtension = assetsForm.FileName.Split('.').Length > 1 ? assetsForm.FileName.Split('.')[1].ToString() : assetsForm.FileName.Split('.')[0].ToString();
                int iAssetId = 0;
                int iLinkId = 0;
                if (assetsForm.AssetId == 0)
                {
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[2];
                        sqlParams[0] = new SqlParameter("@CounterName", "AssetId");
                        sqlParams[1] = new SqlParameter("@CounterValue", CommonFunc.GetDBValue(0))
                        {
                            Direction = ParameterDirection.Output
                        };

                        dh.ExecuteNonQuery("spReserveCounter", CommandType.StoredProcedure, sqlParams);
                        int.TryParse(sqlParams[1].Value.ToString(), out iAssetId);
                        assetsForm.AssetId = iAssetId;
                        assetsForm.FileName = assetsForm.FileName.Split('.').Length > 1 ? assetsForm.AssetId.ToString() + "." + fileExtension : assetsForm.FileName;
                    }
                }

                if (httpRequest.Files.Count > 0)
                {
                    Impersonation.Impersonate();
                    var docfiles = new List<string>();
                    foreach (string file in httpRequest.Files)
                    {
                        var postedFile = httpRequest.Files[file];
                        String filePath = ConfigurationManager.AppSettings["Assets.Path"].ToString().Trim() + assetsForm.AssetId.ToString() + "." + fileExtension;
                        postedFile.SaveAs(filePath);
                        docfiles.Add(filePath);
                    }
                    Impersonation.Revert();
                }

                if (assetsForm.LinkId == 0)
                {
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[2];
                        sqlParams[0] = new SqlParameter("@CounterName", "AssetLinkId");
                        sqlParams[1] = new SqlParameter("@CounterValue", CommonFunc.GetDBValue(0))
                        {
                            Direction = ParameterDirection.Output
                        };

                        dh.ExecuteNonQuery("spReserveCounter", CommandType.StoredProcedure, sqlParams);
                        int.TryParse(sqlParams[1].Value.ToString(), out iLinkId);
                    }
                    assetsForm.LinkId = iLinkId;
                }

                string Content = JsonConvert.SerializeObject(assetsForm);

                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    Array.Clear(sqlParams, 0, sqlParams.Length);
                    sqlParams[0] = new SqlParameter("@AssetJSON", Content);
                    dh.ExecuteNonQuery("spApiSaveAsset", CommandType.StoredProcedure, sqlParams);
                    logger.Info("spApiSaveDeck request end by {0}", ip);
                }

                result = Request.CreateResponse(HttpStatusCode.Created, "Content saved");
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiSaveDeck message:{0}", ex.Message);
                result = Request.CreateResponse(HttpStatusCode.BadRequest, "Content Failed");
            }

            return result;
        }

        [Route("api/Assets/resetExpire")]
        [HttpDelete]
        public string ResetExpire(int AssetId, int ExpiryDays)
        {
            try
            {
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {

                    SqlParameter[] sqlParams = new SqlParameter[2];
                    sqlParams[0] = new SqlParameter("@AssetId", AssetId);
                    sqlParams[1] = new SqlParameter("@AssetsExpiryDays", ExpiryDays);
                    int result = dh.ExecuteNonQuery("spApiResetAsset", CommandType.StoredProcedure, sqlParams);
                }
                return "Content expiry reset";
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiResetAsset message:{0}", ex.Message);
                return "Expiry Date Not Reset";
            }
        }

        private AssetsForm AssetsFormData(int AssetId)
        {
            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                SqlParameter[] sqlParams = new SqlParameter[1];
                sqlParams[0] = new SqlParameter("@AssetId", AssetId);
                DataSet dsAsset = dh.ExecuteDataSet("spApiGetAsset", CommandType.StoredProcedure, sqlParams);
                AssetsForm AssetsFormData = new AssetsForm
                {
                    AssetId = Convert.ToInt32(dsAsset.Tables[0].Rows[0]["AssetId"]),
                    LinkId = Convert.ToInt32(dsAsset.Tables[0].Rows[0]["LinkId"]),
                    AnalystId = Convert.ToInt32(dsAsset.Tables[0].Rows[0]["AnalystId"]),
                    AssetTypeId = Convert.ToInt32(dsAsset.Tables[0].Rows[0]["AssetTypeId"]),
                    Title = (dsAsset.Tables[0].Rows[0]["Title"]).ToString(),
                    FileName = (dsAsset.Tables[0].Rows[0]["FileName"]).ToString(),
                    FileNameOrig = (dsAsset.Tables[0].Rows[0]["FileNameOrig"]).ToString(),
                    FileSize = Convert.ToInt64(dsAsset.Tables[0].Rows[0]["FileSize"]),
                    CreatedById = Convert.ToInt32(dsAsset.Tables[0].Rows[0]["CreatedById"]),
                    ExpiryDate = Convert.ToString(dsAsset.Tables[0].Rows[0]["ExpiryDate"]),
                    Industries = FetchList(dsAsset.Tables[1]),
                    Analysts = FetchList(dsAsset.Tables[3]),
                    Tickers = FetchList(dsAsset.Tables[2]),
                    Owner = dsAsset.Tables[0].Rows[0]["Owner"].ToString()
                };
                return AssetsFormData;
            }
        }

        private List<ItemsList> FetchList(DataTable dt)
        {

            var convertedList = (from rw in dt.AsEnumerable()
                                 select new ItemsList()
                                 {
                                     Value = Convert.ToInt32(rw["FieldId"]),
                                     Display = Convert.ToString(rw["Display"])
                                 }).ToList();

            return convertedList;
        }

        [Route("api/Assets/EncryptText")]
        [AllowAnonymous]
        [HttpGet]
        public IHttpActionResult EncryptText(string text)
        {

            var response = "ashish";
            return Ok(response);
        }
    }
}
