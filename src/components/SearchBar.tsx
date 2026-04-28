export default function SearchBar() {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-2xl w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search location..."
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <select className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          <option value="">Price</option>
          <option value="0-300000">$0 - $300K</option>
          <option value="300000-600000">$300K - $600K</option>
          <option value="600000-1000000">$600K - $1M</option>
          <option value="1000000+">$1M+</option>
        </select>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg active:scale-95">
          Search
        </button>
      </div>
    </div>
  );
}