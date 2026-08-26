import { useState } from 'react';
import { MapPin, Search, AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ParseResult {
  latitude: number;
  longitude: number;
  source: string;
  displayName?: string;
}

function extractCoordinatesFromUrl(url: string): ParseResult | null {
  // Matches patterns like:
  // /@12.9716,77.5946,17z
  // ?q=12.9716,77.5946
  // /search/12.9716,77.5946
  const coordRegex = /[-+]?\d+\.\d+,\s*[-+]?\d+\.\d+/;
  const match = url.match(coordRegex);

  if (!match) return null;

  const [latStr, lngStr] = match[0].split(',');
  const latitude = parseFloat(latStr.trim());
  const longitude = parseFloat(lngStr.trim());

  if (isNaN(latitude) || isNaN(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;

  return { latitude, longitude, source: 'Coordinates found directly in the URL' };
}

function extractSearchQuery(url: string): string | null {
  try {
    const decoded = decodeURIComponent(url);

    const patterns = [
      /\/place\/([^/@?]+)/,
      /\/search\/([^/@?]+)/,
      /[?&]q=([^&]+)/,
      /[?&]query=([^&]+)/,
    ];

    for (const pattern of patterns) {
      const match = decoded.match(pattern);
      if (match && match[1]) {
        return match[1].replace(/[+_]/g, ' ').trim();
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function geocodeWithNominatim(query: string): Promise<ParseResult | null> {
  const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
  searchUrl.searchParams.set('format', 'jsonv2');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('limit', '1');

  const response = await fetch(searchUrl.toString(), {
    headers: {
      'Accept-Language': 'en-US,en',
      'User-Agent': 'MyClasses Location Demo/1.0',
    },
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const result = data[0];
  const latitude = parseFloat(result.lat);
  const longitude = parseFloat(result.lon);

  if (isNaN(latitude) || isNaN(longitude)) return null;

  return {
    latitude,
    longitude,
    source: `Nominatim geocoding for "${query}"`,
    displayName: result.display_name,
  };
}

export default function LocationDemoPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError('');

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please paste a Google Maps URL');
      return;
    }

    setLoading(true);

    try {
      // Strategy 1: Direct coordinate extraction from the URL
      const directCoords = extractCoordinatesFromUrl(trimmedUrl);
      if (directCoords) {
        setResult(directCoords);
        return;
      }

      // Strategy 2: Extract place/address query and geocode with Nominatim
      const query = extractSearchQuery(trimmedUrl);
      if (query) {
        const geocoded = await geocodeWithNominatim(query);
        if (geocoded) {
          setResult(geocoded);
          return;
        }
      }

      setError(
        'Could not extract coordinates from this URL.\n\n' +
          'Short URLs (maps.app.goo.gl) usually cannot be expanded from the browser. ' +
          'Try using the full share URL that contains /@lat,lng in the address bar, ' +
          'or a URL with a clear place/address query.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while parsing the URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-200">
            <MapPin size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
            Location URL Parser
          </h1>
          <p className="text-sm text-slate-500 mt-2 text-center max-w-md">
            Paste a Google Maps URL to extract latitude and longitude. No login required.
          </p>
        </div>

        <form onSubmit={handleParse} className="space-y-4">
          <div>
            <label htmlFor="maps-url" className="block text-sm font-medium text-slate-700 mb-2">
              Google Maps URL
            </label>
            <textarea
              id="maps-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.google.com/maps/place/.../@12.9716,77.5946,..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white transition-colors',
              loading
                ? 'bg-primary-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
            )}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Search size={20} />
                Extract Coordinates
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3">
            <AlertCircle className="shrink-0 text-red-600" size={22} />
            <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex gap-3">
              <CheckCircle2 className="shrink-0 text-green-600" size={22} />
              <div>
                <p className="text-sm font-medium text-green-800">Coordinates found</p>
                <p className="text-sm text-green-700 mt-1">{result.source}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Latitude</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-semibold text-slate-900">{result.latitude}</p>
                  <button
                    onClick={() => copyToClipboard(result.latitude.toString())}
                    className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                    title="Copy latitude"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Longitude</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-semibold text-slate-900">{result.longitude}</p>
                  <button
                    onClick={() => copyToClipboard(result.longitude.toString())}
                    className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                    title="Copy longitude"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            {result.displayName && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Display Name</p>
                <p className="mt-2 text-sm text-slate-700">{result.displayName}</p>
              </div>
            )}

            <a
              href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=16/${result.latitude}/${result.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <ExternalLink size={16} />
              View on OpenStreetMap
            </a>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            Demo only. Coordinates are parsed locally or fetched from Nominatim. Short URLs may not work in the browser.
          </p>
        </div>
      </div>
    </div>
  );
}
