import { useState, useEffect, useCallback } from 'react';
import { Building2, Search } from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import FacilityCard from '../components/facilities/FacilityCard';
import FacilityFilters from '../components/facilities/FacilityFilters';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { FacilityCardSkeleton } from '../components/common/Skeleton';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', type: '', minCapacity: '' });

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      if (filters.minCapacity) params.minCapacity = filters.minCapacity;
      params.status = 'ACTIVE';

      const res = await facilityApi.getAll(params);
      setFacilities(res.data);
    } catch (err) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(fetchFacilities, 300);
    return () => clearTimeout(debounce);
  }, [fetchFacilities]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facilities Catalogue"
        description="Browse and book available campus resources"
      />

      <FacilityFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <FacilityCardSkeleton key={i} />
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No facilities found"
          message="Try adjusting your search or filter criteria"
          action={
            filters.search || filters.type || filters.minCapacity ? (
              <button
                onClick={() => setFilters({ search: '', type: '', minCapacity: '' })}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
              >
                <Search className="w-4 h-4" />
                Clear Filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{facilities.length}</span>{' '}
            {facilities.length === 1 ? 'facility' : 'facilities'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {facilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
