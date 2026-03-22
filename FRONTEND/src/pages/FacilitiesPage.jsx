import { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { facilityApi } from '../api/facilityApi';
import FacilityCard from '../components/facilities/FacilityCard';
import FacilityFilters from '../components/facilities/FacilityFilters';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

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
        <LoadingSpinner message="Loading facilities..." />
      ) : facilities.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No facilities found"
          message="Try adjusting your search or filter criteria"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {facilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </div>
      )}
    </div>
  );
}
