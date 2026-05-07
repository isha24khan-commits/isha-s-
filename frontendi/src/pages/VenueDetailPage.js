import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVenue } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Users, DollarSign, ExternalLink, ArrowLeft, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const VenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenue(id)
      .then(r => setVenue(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToplan = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    try {
      await api.post('/plans/venue', { venue_id: parseInt(id) });
      toast.success('Venue added to your plan!');
      navigate('/my-plan');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add venue');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-nunito">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (!venue) return null;

  // FIX: Check for both lowercase and uppercase keys to be safe
  const venueImage = venue.image_url || venue.IMAGE_URL;

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-nunito">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/venues')}
          className="flex items-center gap-2 text-slate-600 hover:text-amber-500 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Venues</span>
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          {/* Venue Image Section */}
          <div className="h-96 bg-slate-100 flex items-center justify-center overflow-hidden relative">
            {venueImage ? (
              <img
                src={venueImage}
                alt={venue.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/800x450?text=Image+Not+Found';
                }}
              />
            ) : (
              <div className="flex flex-col items-center text-slate-300">
                <ImageIcon size={80} strokeWidth={1} />
                <span className="text-xs font-bold uppercase mt-2">No Image Available</span>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="font-fredoka text-4xl text-slate-900 mb-2">
                  {venue.name}
                </h1>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={18} className="text-amber-500" />
                  <span>{venue.location}</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-2 text-slate-600">
                  <Users size={20} />
                  <span className="font-fredoka text-lg">Capacity</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {venue.capacity}
                  <span className="text-lg font-normal text-slate-500 ml-2">guests</span>
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-2 text-slate-600">
                  <DollarSign size={20} />
                  <span className="font-fredoka text-lg">Price Per Day</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  ${parseFloat(venue.price_per_day || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleAddToplan}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Add to My Plan
              </button>

              {venue.vendor_link && (
                <a
                  href={venue.vendor_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-2xl font-bold text-lg border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  Visit Website
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;