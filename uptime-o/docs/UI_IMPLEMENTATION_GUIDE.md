# UI Implementation Guide: Getting Started with Region Entity

**Document Version**: 1.0  
**Date**: November 1, 2025  
**Focus**: Step-by-step implementation of Region UI component

---

## 1. Prerequisites

Ensure you have:
- ✅ React 18+ and TypeScript knowledge
- ✅ Redux Toolkit understanding
- ✅ Backend Region API endpoints working
- ✅ Development environment set up (see SETUP.md)

---

## 2. Backend API Verification

### Expected Endpoints

Your backend should provide these endpoints:

```bash
# List regions (paginated)
GET /api/regions?page=0&size=20&search=&sort=name,asc
Response: {
  "content": [
    {"id": 1, "name": "US East", "regionCode": "use", "groupName": "Americas"},
    ...
  ],
  "pageable": {"pageNumber": 0, "pageSize": 20},
  "totalElements": 5,
  "totalPages": 1
}

# Get single region
GET /api/regions/{id}
Response: {
  "id": 1,
  "name": "US East",
  "regionCode": "use",
  "groupName": "Americas",
  "description": "US East Coast region",
  "timezone": "America/New_York"
}

# Create region
POST /api/regions
Body: {
  "name": "US East",
  "regionCode": "use",
  "groupName": "Americas"
}
Response: {...}

# Update region
PUT /api/regions/{id}
Body: {...}

# Delete region
DELETE /api/regions/{id}
```

### Verify Endpoints
```bash
# Test GET
curl -X GET http://localhost:8080/api/regions

# Test POST
curl -X POST http://localhost:8080/api/regions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","regionCode":"test","groupName":"test"}'
```

---

## 3. Step-by-Step Implementation

### Step 1: Create Type Definitions

**File**: `src/main/webapp/app/modules/infrastructure/regions/types/region.ts`

```typescript
// 1. Create the directory structure first
mkdir -p src/main/webapp/app/modules/infrastructure/regions/{types,services,hooks,store,components,styles}

// 2. Create region.ts with types
```

**Action**: Copy the type definitions from section 6.1 of UI_DESIGN document

**Test it**:
```bash
# Check TypeScript compilation
npm run build
```

---

### Step 2: Create API Service Layer

**File**: `src/main/webapp/app/modules/infrastructure/regions/services/regionService.ts`

**Action**: Copy the service from section 6.2 of UI_DESIGN document

**Test it**:
```typescript
// In your browser console or test file
import { RegionService } from './regionService';
const service = new RegionService();
const regions = await service.listRegions(0, 20);
console.log(regions);
```

---

### Step 3: Create Redux Slice

**File**: `src/main/webapp/app/modules/infrastructure/regions/store/regionSlice.ts`

**Action**: Copy the Redux slice from section 6.3 of UI_DESIGN document

**Register in store**:

**File**: `src/main/webapp/app/store/rootReducer.ts`

```typescript
import regionReducer from '../modules/infrastructure/regions/store/regionSlice';

export const rootReducer = {
  // ... other reducers
  regions: regionReducer,
};
```

---

### Step 4: Create Custom Hook for Form

**File**: `src/main/webapp/app/modules/infrastructure/regions/hooks/useRegionForm.ts`

**Action**: Copy the hook from section 6.4 of UI_DESIGN document

**Test it**:
```typescript
// In a test component
const { formData, errors, handleChange, handleSubmit } = useRegionForm(
  async (data) => {
    console.log('Submitting:', data);
    await regionService.createRegion(data);
  }
);
```

---

### Step 5: Create List View Component

**File**: `src/main/webapp/app/modules/infrastructure/regions/components/RegionListTable.tsx`

**Action**: Copy from section 6.5, enhance with:

```typescript
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchRegions, toggleRegionSelection } from '../store/regionSlice';
import '../styles/region.module.css';

interface RegionListTableProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const RegionListTable: React.FC<RegionListTableProps> = ({
  onEdit,
  onDelete,
}) => {
  const dispatch = useAppDispatch();
  const { regions, loading, pagination, selectedRegions } = useAppSelector(
    (state) => state.regions
  );

  useEffect(() => {
    dispatch(fetchRegions({ page: 0, pageSize: 20 }));
  }, [dispatch]);

  const handleSelect = (id: number) => {
    dispatch(toggleRegionSelection(id));
  };

  if (loading) {
    return <div className="loading-spinner">Loading regions...</div>;
  }

  if (regions.length === 0) {
    return (
      <div className="empty-state">
        <p>No regions found. Create your first region to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="region-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRegions.length === regions.length}
                onChange={(e) => {
                  // Handle select all
                }}
              />
            </th>
            <th>Name</th>
            <th>Code</th>
            <th>Group</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => (
            <tr key={region.id} className={selectedRegions.includes(region.id) ? 'selected' : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region.id)}
                  onChange={() => handleSelect(region.id)}
                />
              </td>
              <td>{region.name}</td>
              <td><code>{region.regionCode}</code></td>
              <td>{region.groupName || '-'}</td>
              <td>
                <button
                  className="action-button edit"
                  onClick={() => onEdit(region.id)}
                  title="Edit"
                >
                  ✎ Edit
                </button>
                <button
                  className="action-button delete"
                  onClick={() => onDelete(region.id)}
                  title="Delete"
                >
                  ✕ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

### Step 6: Create Form Component

**File**: `src/main/webapp/app/modules/infrastructure/regions/components/RegionForm.tsx`

```typescript
import React from 'react';
import { RegionFormData } from '../types/region';
import { useRegionForm } from '../hooks/useRegionForm';
import { RegionService } from '../services/regionService';
import '../styles/region.module.css';

interface RegionFormProps {
  onSuccess?: () => void;
  initialData?: RegionFormData;
  isEditing?: boolean;
}

export const RegionForm: React.FC<RegionFormProps> = ({
  onSuccess,
  initialData,
  isEditing = false,
}) => {
  const regionService = new RegionService();

  const handleSubmit = async (data: RegionFormData) => {
    if (isEditing && initialData?.id) {
      // await regionService.updateRegion(initialData.id, data);
    } else {
      await regionService.createRegion(data);
    }
    onSuccess?.();
  };

  const { formData, errors, submitting, handleChange, handleSubmit: onSubmit } =
    useRegionForm(handleSubmit);

  return (
    <form onSubmit={onSubmit} className="region-form">
      <div className="form-group">
        <label htmlFor="name">Region Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., US East Coast"
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="regionCode">Region Code *</label>
        <input
          id="regionCode"
          type="text"
          value={formData.regionCode}
          onChange={(e) => handleChange('regionCode', e.target.value.toUpperCase())}
          placeholder="e.g., USE1"
          className={errors.regionCode ? 'error' : ''}
        />
        {errors.regionCode && <span className="error-message">{errors.regionCode}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="groupName">Group Name</label>
        <input
          id="groupName"
          type="text"
          value={formData.groupName || ''}
          onChange={(e) => handleChange('groupName', e.target.value)}
          placeholder="e.g., Americas"
        />
      </div>

      <div className="form-group">
        <label htmlFor="timezone">Timezone</label>
        <select
          id="timezone"
          value={formData.timezone || ''}
          onChange={(e) => handleChange('timezone', e.target.value)}
        >
          <option value="">Select Timezone</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">UTC+0</option>
          <option value="Europe/Paris">UTC+1</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
          <option value="Australia/Sydney">Australia/Sydney</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Saving...' : isEditing ? 'Update Region' : 'Create Region'}
        </button>
        <button type="button" onClick={() => window.history.back()} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};
```

---

### Step 7: Create List Page Component

**File**: `src/main/webapp/app/modules/infrastructure/regions/RegionListPage.tsx`

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteRegion } from './store/regionSlice';
import { RegionListTable } from './components/RegionListTable';
import './styles/region.module.css';

export const RegionListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { regions, loading } = useAppSelector((state) => state.regions);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    navigate(`/infrastructure/regions/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this region?')) {
      dispatch(deleteRegion(id));
    }
  };

  const handleCreate = () => {
    navigate('/infrastructure/regions/new');
  };

  return (
    <div className="region-list-page">
      <div className="page-header">
        <h1>Regions</h1>
        <p>Manage geographic regions for distributed monitoring</p>
      </div>

      <div className="page-actions">
        <button onClick={handleCreate} className="btn btn-primary">
          + Create Region
        </button>
      </div>

      <RegionListTable
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selected={[]}
        regions={regions}
        onSelect={() => {}}
      />
    </div>
  );
};
```

---

### Step 8: Create Form Page Component

**File**: `src/main/webapp/app/modules/infrastructure/regions/RegionFormPage.tsx`

```typescript
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRegionDetail } from './store/regionSlice';
import { RegionForm } from './components/RegionForm';
import './styles/region.module.css';

export const RegionFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentRegion, detailLoading } = useAppSelector((state) => state.regions);
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchRegionDetail(parseInt(id)));
    }
  }, [id, isEditing, dispatch]);

  const handleSuccess = () => {
    navigate('/infrastructure/regions');
  };

  return (
    <div className="region-form-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{isEditing ? `Edit Region: ${currentRegion?.name}` : 'Create New Region'}</h1>
      </div>

      {detailLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="form-container">
          <RegionForm
            onSuccess={handleSuccess}
            initialData={currentRegion}
            isEditing={isEditing}
          />
        </div>
      )}
    </div>
  );
};
```

---

### Step 9: Create Routing

**File**: `src/main/webapp/app/modules/infrastructure/regions/index.tsx`

```typescript
import React from 'react';
import { Route } from 'react-router-dom';
import { RegionListPage } from './RegionListPage';
import { RegionFormPage } from './RegionFormPage';

export const regionRoutes = (
  <>
    <Route path="regions" element={<RegionListPage />} />
    <Route path="regions/new" element={<RegionFormPage />} />
    <Route path="regions/:id/edit" element={<RegionFormPage />} />
  </>
);
```

**Register in main routes**:

**File**: `src/main/webapp/app/App.tsx`

```typescript
import { regionRoutes } from './modules/infrastructure/regions';

// Inside your main Router component
<Routes>
  {/* Other routes */}
  <Route path="/infrastructure/*" element={<InfrastructureLayout />}>
    {regionRoutes}
  </Route>
</Routes>
```

---

### Step 10: Create Styles

**File**: `src/main/webapp/app/modules/infrastructure/regions/styles/region.module.css`

```css
/* Layout */
.region-list-page,
.region-form-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.page-header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Actions */
.page-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0066cc;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0052a3;
  box-shadow: 0 4px 6px rgba(0, 102, 204, 0.15);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Table */
.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.region-table {
  width: 100%;
  border-collapse: collapse;
}

.region-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.region-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.region-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.15s ease;
}

.region-table tbody tr:hover {
  background: #f9fafb;
}

.region-table tbody tr.selected {
  background: #eff6ff;
}

.region-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
}

.region-table code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* Action buttons */
.action-button {
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.edit {
  background: #dbeafe;
  color: #0369a1;
}

.action-button.edit:hover {
  background: #bfdbfe;
}

.action-button.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-button.delete:hover {
  background: #fecaca;
}

/* Forms */
.region-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 8px;
  color: #6b7280;
}

/* Loading spinner */
.loading-spinner {
  text-align: center;
  padding: 48px;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .region-list-page,
  .region-form-page {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .region-table {
    font-size: 12px;
  }

  .region-table th,
  .region-table td {
    padding: 8px;
  }

  .action-button {
    display: block;
    width: 100%;
    margin-right: 0;
    margin-bottom: 4px;
  }
}
```

---

## 4. Testing Checklist

### Unit Tests

**File**: `src/main/webapp/app/modules/infrastructure/regions/__tests__/RegionListTable.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { RegionListTable } from '../components/RegionListTable';
import { Region } from '../types/region';

describe('RegionListTable', () => {
  const mockRegions: Region[] = [
    {
      id: 1,
      name: 'US East',
      regionCode: 'use',
      groupName: 'Americas',
    },
  ];

  test('renders region table', () => {
    render(
      <RegionListTable
        regions={mockRegions}
        loading={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onSelect={jest.fn()}
        selected={[]}
      />
    );

    expect(screen.getByText('US East')).toBeInTheDocument();
    expect(screen.getByText('use')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(
      <RegionListTable
        regions={mockRegions}
        loading={false}
        onEdit={onEdit}
        onDelete={jest.fn()}
        onSelect={jest.fn()}
        selected={[]}
      />
    );

    const editButton = screen.getByTitle('Edit');
    editButton.click();
    expect(onEdit).toHaveBeenCalledWith(1);
  });
});
```

### Integration Tests

```typescript
// In RegionListPage.test.tsx
test('displays list of regions and allows navigation', async () => {
  // Mock API responses
  // Render component
  // Check regions are displayed
  // Click on region
  // Verify navigation
});
```

---

## 5. Running the Application

```bash
# Start backend
./mvnw spring-boot:run

# In another terminal, start frontend
npm start

# Navigate to regions
# http://localhost:4200/infrastructure/regions
```

---

## 6. Debugging Tips

```typescript
// Add Redux DevTools logging
import logger from 'redux-logger';
// Add to Redux store middleware

// API logging
const api = axios.create({
  interceptors: {
    request: (config) => {
      console.log('API Request:', config.url, config.data);
      return config;
    },
  },
});

// Component debugging
console.log('Component state:', state);
```

---

## 7. Next: From Region to Datacenters

Once Region is complete:
1. Follow same pattern for Datacenter entity
2. Add relationship: Datacenter → Region (foreign key)
3. Display datacenters in Region detail view
4. Create Datacenter form with Region selector

---

**Implementation Complete Checklist**

- [ ] Types defined
- [ ] API service created
- [ ] Redux slice implemented
- [ ] Form hook created
- [ ] List table component
- [ ] Form component
- [ ] List page
- [ ] Form page
- [ ] Routing configured
- [ ] Styles applied
- [ ] Tested locally
- [ ] API integration verified
- [ ] Performance checked
- [ ] Error handling tested
- [ ] Responsive design verified

---

**Document End**

Ready to implement? Start with Step 1!
