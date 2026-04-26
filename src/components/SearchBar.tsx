export default function SearchBar() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Location"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Price Range</option>
          <option value="0-300000">$0 - $300,000</option>
          <option value="300000-600000">$300,000 - $600,000</option>
          <option value="600000-1000000">$600,000 - $1,000,000</option>
          <option value="1000000+">$1,000,000+</option>
        </select>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Search
        </button>
      </div>
    </div>
  );
}