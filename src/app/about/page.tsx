export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Sunrise Realty</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are dedicated to helping you find the perfect home that matches your lifestyle and dreams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Sunrise Realty, our mission is to provide exceptional real estate services
              that make buying, selling, and renting properties a seamless and enjoyable experience.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We believe that finding a home is one of life&apos;s most important decisions,
              and we&apos;re here to guide you every step of the way with expertise, integrity, and personalized service.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Why Choose Us?</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="ml-3 text-gray-700">Extensive knowledge of local markets</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="ml-3 text-gray-700">Personalized service tailored to your needs</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="ml-3 text-gray-700">Transparent and honest communication</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="ml-3 text-gray-700">Modern technology and marketing strategies</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-8">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">John Smith</h3>
              <p className="text-gray-600">Senior Real Estate Agent</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">Sarah Johnson</h3>
              <p className="text-gray-600">Property Manager</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">Mike Davis</h3>
              <p className="text-gray-600">Marketing Specialist</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}