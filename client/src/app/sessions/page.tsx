"use client";

import { getAllSessions } from "@/services/root";
import { useQuery } from "@tanstack/react-query";

export default function Sessions() {
  const { data } = useQuery({
    queryFn: getAllSessions,
    queryKey: ["get-all-sessions"],
  });

  const sessionList = data?.data ?? [];

  console.log({ sessionList });

  return (
    <div className="flex flex-col gap-[12px]">
      <h1>Sessions List</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>deleted</th>
            <th>document_id</th>
            <th>joined_session_id</th>
            <th>session_data</th>
            <th>session_id</th>
            <th>session_type</th>
            <th>user_id</th>
            <th>zoho_document_id</th>
          </tr>
        </thead>
        <tbody>
          {sessionList.map(
            ({
              id,
              deleted,
              document_id,
              joined_session_id,
              session_data,
              session_id,
              session_type,
              user_id,
              zoho_document_id,
            }) => {
              return (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{deleted ? "true" : "false"}</td>
                  <td>{document_id}</td>
                  <td>{joined_session_id}</td>
                  <td>{session_data ? "true" : "false"}</td>
                  <td>{session_id ? "true" : "false"}</td>
                  <td>{session_type}</td>
                  <td>{user_id}</td>
                  <td>{zoho_document_id}</td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}
/*
{
  "id": 1,
  "document_id": null,
  "user_id": 1,
  "zoho_document_id": "1704164229723",
  "session_data": "{\"documentUrl\":\"https://api.office-integrator.com/writer/officeapi/v1/documents/8fcde05f0f2854835155ea0da39d3ab44a75119112d21a9ece4393aafc68c89a4ecb5ff0a2d85c4be52611fc44c0ac998e8650bf58e029153e92de5764429f794928122a1432ec4ec809cde72e0453cce45a32865f6a81fb939e3ce8fd5e80cc/edit\",\"documentId\":\"1704164229723\",\"saveUrl\":\"https://api.office-integrator.com/writer/officeapi/v1/documents/8fcde05f0f2854835155ea0da39d3ab44a75119112d21a9ece4393aafc68c89a4ecb5ff0a2d85c4be52611fc44c0ac998e8650bf58e029153e92de5764429f794928122a1432ec4ec809cde72e0453cce45a32865f6a81fb939e3ce8fd5e80cc/save\",\"sessionId\":\"8fcde05f0f2854835155ea0da39d3ab44a75119112d21a9ece4393aafc68c89a4ecb5ff0a2d85c4be52611fc44c0ac998e8650bf58e029153e92de5764429f794928122a1432ec4ec809cde72e0453cce45a32865f6a81fb939e3ce8fd5e80cc\",\"sessionDeleteUrl\":\"https://api.office-integrator.com/writer/officeapi/v1/sessions/8fcde05f0f2854835155ea0da39d3ab44a75119112d21a9ece4393aafc68c89a4ecb5ff0a2d85c4be52611fc44c0ac998e8650bf58e029153e92de5764429f794928122a1432ec4ec809cde72e0453cce45a32865f6a81fb939e3ce8fd5e80cc\",\"documentDeleteUrl\":\"https://api.office-integrator.com/writer/officeapi/v1/documents/1704164229723\",\"keyModified\":{}}",
  "session_type": "create",
  "session_id": "8fcde05f0f2854835155ea0da39d3ab44a75119112d21a9ece4393aafc68c89a4ecb5ff0a2d85c4be52611fc44c0ac998e8650bf58e029153e92de5764429f794928122a1432ec4ec809cde72e0453cce45a32865f6a81fb939e3ce8fd5e80cc",
  "deleted": false,
  "joined_session_id": null
}
 */
