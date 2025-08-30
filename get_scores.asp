<!--#include file="config.asp"-->
<%
Response.ContentType = "application/json"
Response.CodePage = 65001  ' UTF-8

Dim conn, rs, sql
Set conn = Server.CreateObject("ADODB.Connection")
Set rs = Server.CreateObject("ADODB.Recordset")

conn.Open connStr

sql = "SELECT name, score, CONVERT(VARCHAR, playtime, 120) AS playtime, comment FROM raydb ORDER BY score ASC"
rs.Open sql, conn

Dim result, first
result = "["
first = True

Do Until rs.EOF
    If Not first Then result = result & "," Else first = False
    result = result & "{""name"":""" & rs("name") & ""","
    result = result & """score"":" & rs("score") & ","
    result = result & """playtime"":""" & rs("playtime") & ""","
    result = result & """comment"":""" & Replace(rs("comment"), """", "\""") & """}"
    rs.MoveNext
Loop

result = result & "]"

rs.Close
conn.Close

Response.Write result
%>
