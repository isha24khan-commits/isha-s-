import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getThemes } from '../services/api';
import { Sparkles } from 'lucide-react';

const ThemesPage = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await getThemes();
        setThemes(response.data);
      } catch (error) {
        console.error('Error fetching themes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchThemes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500 font-nunito">Loading themes...</p>
        </div>
      </div>
    );
  }

  // Assign standard Tailwind grid spans to create the Bento effect
  const getBentoSize = (index) => {
    const pattern = [
      'md:col-span-2 md:row-span-2', // Large Square
      'md:col-span-1 md:row-span-1', // Small
      'md:col-span-1 md:row-span-1', // Small
      'md:col-span-2 md:row-span-1', // Wide Rectangle
      'md:col-span-1 md:row-span-1', // Small
      'md:col-span-1 md:row-span-1', // Small
    ];
    return pattern[index % pattern.length];
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12" data-testid="themes-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            <Sparkles size={16} />
            Party Themes
          </div>
          <h1 className="font-fredoka text-4xl sm:text-5xl text-slate-900 mb-4">
            Find Your Perfect{' '}
            <span className="gradient-text">Theme</span>
          </h1>
          <p className="font-nunito text-lg text-slate-600 max-w-2xl mx-auto">
            Choose from our magical collection of birthday party themes. 
            Each theme comes with unique decorations and styling options.
          </p>
        </div>

        {/* Bento Grid with standard Tailwind spans */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 auto-rows-[200px] justify-center">
          {themes.map((theme, index) => (
            <Link
              key={theme.theme_id}
              to={`/themes/${theme.theme_id}`}
              className={`${getBentoSize(index)} relative overflow-hidden rounded-3xl group card-hover shadow-md bg-white`}
              data-testid={`theme-card-${theme.theme_id}`}
            >
              <img
                src={theme.image_url || theme.IMAGE_URL}
                alt={theme.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Theme+Coming+Soon'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="font-fredoka text-white text-lg md:text-xl lg:text-2xl leading-tight">
                  {theme.name}
                </h3>
                <p className="font-nunito text-white/90 text-sm mt-1 line-clamp-2 hidden md:block">
                  {theme.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Fallback if no themes exist yet */}
        {themes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-nunito">No themes found. Add some in the Admin Dashboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemesPage;