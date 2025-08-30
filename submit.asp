<%@ Language=VBScript CodePage=65001 %>
<% Response.CodePage = 65001
Response.CharSet = "utf-8"
Response.ContentType = "text/html;charset=utf-8" %>
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <title>寫入結果</title>
</head>
<body>

<!--#include file="config.asp"-->
<%

' 檢查是否 POST 方法
If Request.ServerVariables("REQUEST_METHOD") <> "POST" Then
    Response.Status = "405 Method Not Allowed"
    Response.Write "❌ 不允許的請求方法"
    Response.End
End If

' 檢查來源 referer 或 origin
Dim allowedHost, referer, origin
allowedHost = "https://www.favorunion.com"

referer = LCase(Request.ServerVariables("HTTP_REFERER"))
origin = LCase(Request.ServerVariables("HTTP_ORIGIN"))

If InStr(referer, allowedHost) = 0 And InStr(origin, allowedHost) = 0 Then
    Response.Status = "403 Forbidden"
    Response.Write "❌ 非法來源請求被封鎖"
    Response.End
End If


' 接收表單資料
Dim name, score, comment, conn, sql, cmd

name = Request.Form("name")
score = Request.Form("score")
comment = Request.Form("comment")

' 建立連線
Set conn = Server.CreateObject("ADODB.Connection")
conn.Open connStr

' 建立主鍵 ID，使用最大值+1
Dim rs, nextID
Set rs = conn.Execute("SELECT ISNULL(MAX(ID), 0) + 1 AS nextID FROM raydb")
nextID = rs("nextID")
rs.Close
Set rs = Nothing

' 建立 SQL 指令，使用 GETDATE() 取得伺服器時間
sql = "INSERT INTO raydb (ID, name, score, playtime, comment) " & _
      "VALUES (?, ?, ?, GETDATE(), ?)"

Set cmd = Server.CreateObject("ADODB.Command")
With cmd
    .ActiveConnection = conn
    .CommandText = sql
    .CommandType = 1 ' adCmdText
    .Parameters.Append .CreateParameter("p1", 3, 1, , nextID) ' int
    .Parameters.Append .CreateParameter("p2", 202, 1, 50, name) ' nvarchar
    .Parameters.Append .CreateParameter("p3", 3, 1, , score) ' int
    .Parameters.Append .CreateParameter("p4", 202, 1, 255, comment) ' nvarchar
    .Execute
End With

' 關閉連線
Set cmd = Nothing
conn.Close
Set conn = Nothing

Response.Write "<h3>資料成功寫入！</h3>"
%>
<p><a href="form.html">回到表單</a></p>
</body>
</html>
