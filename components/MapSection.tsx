'use client';

type MapSectionProps = {
  location: {
    address: string;
    lat: number;
    lng: number;
  };
};

export default function MapSection({ location }: MapSectionProps) {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${location.lat},${location.lng}&zoom=15`;
  
  // API key olmadığında statik harita göster
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=600x400&markers=color:red%7C${location.lat},${location.lng}&key=YOUR_GOOGLE_MAPS_API_KEY`;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-3xl">📍</span>
          Kalkış Noktası
        </h3>
        <p className="text-gray-700 mt-2">{location.address}</p>
      </div>
      
      {/* Harita */}
      <div className="relative h-96 bg-gray-100">
        {/* Geçici: API key olmadan gösterim */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-700 font-medium mb-4">{location.address}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[#91A8D0] text-white rounded-lg font-semibold hover:bg-[#7a90bb] transition-colors"
            >
              📍 Google Maps'te Aç
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}








