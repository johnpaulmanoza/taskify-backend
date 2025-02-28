"use client";

export function DatabaseSchemaSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Database Schema</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">users</h3>
          <ul className="list-disc pl-5">
            <li>id (INT, AUTO_INCREMENT, PRIMARY KEY)</li>
            <li>username (VARCHAR(255), UNIQUE)</li>
            <li>email (VARCHAR(255), UNIQUE)</li>
            <li>password (VARCHAR(255), hashed)</li>
            <li>created_at (TIMESTAMP)</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">boards</h3>
          <ul className="list-disc pl-5">
            <li>id (INT, AUTO_INCREMENT, PRIMARY KEY)</li>
            <li>user_id (INT, FOREIGN KEY)</li>
            <li>title (VARCHAR(255))</li>
            <li>description (TEXT)</li>
            <li>created_at (TIMESTAMP)</li>
            <li>updated_at (TIMESTAMP)</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">lists</h3>
          <ul className="list-disc pl-5">
            <li>id (INT, AUTO_INCREMENT, PRIMARY KEY)</li>
            <li>board_id (INT, FOREIGN KEY)</li>
            <li>title (VARCHAR(255))</li>
            <li>position (INT)</li>
            <li>created_at (TIMESTAMP)</li>
            <li>updated_at (TIMESTAMP)</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">cards</h3>
          <ul className="list-disc pl-5">
            <li>id (INT, AUTO_INCREMENT, PRIMARY KEY)</li>
            <li>list_id (INT, FOREIGN KEY)</li>
            <li>title (VARCHAR(255))</li>
            <li>description (TEXT)</li>
            <li>position (INT)</li>
            <li>created_at (TIMESTAMP)</li>
            <li>updated_at (TIMESTAMP)</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">labels</h3>
          <ul className="list-disc pl-5">
            <li>id (INT, AUTO_INCREMENT, PRIMARY KEY)</li>
            <li>name (VARCHAR(255))</li>
            <li>color (VARCHAR(50))</li>
            <li>created_at (TIMESTAMP)</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">card_labels</h3>
          <ul className="list-disc pl-5">
            <li>card_id (INT, FOREIGN KEY)</li>
            <li>label_id (INT, FOREIGN KEY)</li>
            <li>PRIMARY KEY (card_id, label_id)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}