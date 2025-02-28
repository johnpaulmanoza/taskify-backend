"use client";

export function GettingStartedSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
      <p className="mb-2">
        This API provides endpoints to manage boards, lists, cards, and labels in Taskify.
        All endpoints return JSON responses and accept JSON request bodies where applicable.
      </p>
      <p>
        The database is automatically initialized when the application starts. You can start using the API right away.
      </p>
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Sample User</h3>
        <p>A sample user has been created for testing:</p>
        <ul className="list-disc pl-5 mt-2">
          <li><strong>Username:</strong> testuser</li>
          <li><strong>Email:</strong> test@example.com</li>
          <li><strong>Password:</strong> password123</li>
        </ul>
      </div>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-semibold mb-2">MySQL Database Setup</h3>
        <p>This application uses MySQL. To set up the database:</p>
        <ol className="list-decimal pl-5 mt-2">
          <li>Install MySQL on your machine</li>
          <li>Create a database named <code>trello_clone</code></li>
          <li>Update the <code>.env</code> file with your MySQL credentials</li>
          <li>Run <code>npm run db:migrate</code> to create the database schema</li>
        </ol>
      </div>
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Troubleshooting MySQL Connection</h3>
        <p>If you encounter connection issues:</p>
        <ol className="list-decimal pl-5 mt-2">
          <li>Verify MySQL is running on your machine</li>
          <li>Check your MySQL credentials in the <code>.env</code> file</li>
          <li>Ensure the MySQL port (default: 3306) is not blocked by a firewall</li>
          <li>Try connecting with the MySQL command line client to verify your setup</li>
          <li>For macOS: <code>brew services start mysql</code> to start MySQL</li>
          <li>For Linux: <code>sudo service mysql start</code> to start MySQL</li>
          <li>For Windows: Check MySQL in Services or use MySQL Workbench</li>
        </ol>
      </div>
    </div>
  );
}