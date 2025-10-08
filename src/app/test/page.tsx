export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">CSS Test Page</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700 mb-4">This is a test to see if Tailwind CSS is working properly.</p>
          <div className="flex gap-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Primary Button
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
              Secondary Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
