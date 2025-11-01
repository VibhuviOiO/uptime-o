# UI Design: Synthetic API Testing Platform

**Document Version**: 1.0  
**Date**: November 1, 2025  
**Status**: Design Phase  
**Focus**: Infrastructure-First, Single Entity Pattern

---

## 1. Product Overview

### Core Concept
UptimeO Synthetic Testing is an **infrastructure-first** monitoring platform where:
1. **Infrastructure is defined first** (Regions → Datacenters → Agents)
2. **Schedules define test intervals** and thresholds
3. **Monitors are API tests** configured to run via agents
4. **Agents pull configurations** and execute tests
5. **Heartbeats capture execution results** across infrastructure

### Architecture Flow
```
Regions (Global)
    ↓
Datacenters (Regional)
    ↓
Agents (Datacenter instances, pull config)
    ↓
Monitors (API tests assigned to regions/datacenters)
    ↓
Schedules (Test frequency & thresholds)
    ↓
Heartbeats (Execution results from agents)
```

---

## 2. Information Hierarchy & Navigation

### Main Navigation Structure
```
UptimeO Dashboard
├── Infrastructure
│   ├── Regions
│   ├── Datacenters
│   ├── Agents (Agent Management)
│   └── Agent Configuration Sync
├── Monitors
│   ├── API Tests (HttpMonitor)
│   ├── Schedules
│   └── Monitor Assignments
├── Monitoring
│   ├── Real-time Heartbeats
│   ├── Dashboard
│   ├── Alerts & Incidents
│   └── Reports
├── Settings
│   ├── Agent Configuration
│   ├── Credentials & Secrets
│   └── Webhooks
└── Help & Docs
```

---

## 3. Entity Relationship & UI Flow

### Data Model Context
```
INFRASTRUCTURE LAYER:
  Region (1)
    └── Datacenter (N) [code, name]
        └── Agent (N) [name, location]

TESTING LAYER:
  Schedule (1) [name, interval, thresholds]
    └── HttpMonitor (N) [name, method, url, headers, body]
        ├── Heartbeats (N) [status, latency, errors]
        └── DatacenterMonitor (N) [results by datacenter]

EXECUTION LAYER:
  HttpHeartbeat [timestamp, status, response time, error details]
    ├── Monitor (1 HttpMonitor)
    ├── Agent (1 Agent)
    └── JSON Fields [rawRequestHeaders, rawResponseHeaders, rawResponseBody]
```

---

## 4. Phase 1: Single Entity UI - Region Management

**Starting Point**: Build Region UI first (Infrastructure Foundation)

### 4.1 Region List View

**Path**: `/infrastructure/regions`

**Component**: `RegionListPage.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Regions                                                     │
│ Manage geographic regions for distributed monitoring        │
└─────────────────────────────────────────────────────────────┘

┌─ Filters ───────────────────────────────────────────────────┐
│ [Search by name] [Filter: Active/Inactive] [Sort: Name ▼]  │
└─────────────────────────────────────────────────────────────┘

┌─ Actions ───────────────────────────────────────────────────┐
│ [+ Create Region] [Bulk Actions ▼] [Export CSV]            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Regions (5)                                                 │
├─────────────────────────────────────────────────────────────┤
│ ☐ Name           │ Code  │ Datacenters │ Agents │ Status    │
├─────────────────────────────────────────────────────────────┤
│ ☐ US East        │ use   │ 3          │ 12     │ ✓ Active  │
│ ☐ US West        │ usw   │ 2          │ 8      │ ✓ Active  │
│ ☐ Europe         │ eu    │ 2          │ 5      │ ✓ Active  │
│ ☐ Asia Pacific   │ ap    │ 2          │ 6      │ ⚠ Warning│
│ ☐ South America  │ sa    │ 1          │ 3      │ ✓ Active  │
├─────────────────────────────────────────────────────────────┤
│ < 1 2 3 >    Showing 1-5 of 5                               │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Search by region name
- Filter by status (Active/Inactive)
- Sort by name, datacenter count, agent count
- Quick actions: Edit, View Details, Delete
- Bulk operations: Activate, Deactivate, Delete
- Row expansion to show datacenters
- Export to CSV

**State Management**:
```typescript
interface RegionListState {
  regions: Region[];
  loading: boolean;
  error?: string;
  search: string;
  filters: {
    status?: 'active' | 'inactive';
  };
  sort: {
    field: 'name' | 'datacenters' | 'agents';
    order: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  selectedRegions: number[];
}
```

---

### 4.2 Region Create/Edit Form

**Path**: `/infrastructure/regions/new` | `/infrastructure/regions/:id/edit`

**Component**: `RegionFormPage.tsx`

```
┌──────────────────────────────────────────────────────────────┐
│ ← Create New Region                                          │
└──────────────────────────────────────────────────────────────┘

┌─ Basic Information ──────────────────────────────────────────┐
│                                                              │
│ Region Name *                                               │
│ [_______________________________]                           │
│  Enter a descriptive name (e.g., US East Coast)            │
│                                                              │
│ Region Code *                                               │
│ [_________]                                                 │
│  Short code for APIs (e.g., use1, eu-west-1)             │
│                                                              │
│ Group Name                                                  │
│ [_______________________________]                           │
│  Logical grouping (e.g., Americas, Europe)                │
│                                                              │
│ Description                                                 │
│ ┌──────────────────────────────────────────────────────────┐
│ │                                                          │
│ │ Optional details about this region                       │
│ │                                                          │
│ └──────────────────────────────────────────────────────────┘
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ Advanced Settings ──────────────────────────────────────────┐
│ [▼] Advanced                                                 │
│                                                              │
│ Timezone:        [Select Timezone ▼]                       │
│ Latitude:        [__________]                              │
│ Longitude:       [__________]                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ [Cancel]  [Save Region]  [Save & Create Datacenters]       │
└─────────────────────────────────────────────────────────────┘
```

**Form Fields**:
```typescript
interface RegionFormData {
  name: string;           // Required, 1-50 chars
  regionCode: string;     // Required, 1-20 chars, unique
  groupName?: string;     // Optional, 1-20 chars
  description?: string;   // Optional
  timezone?: string;      // Optional
  latitude?: number;      // Optional
  longitude?: number;     // Optional
}
```

**Validation Rules**:
- Name: Required, 1-50 characters
- Region Code: Required, unique, alphanumeric + hyphens
- Group Name: 1-20 characters
- Latitude/Longitude: Valid coordinate range

**Error Handling**:
```typescript
interface ValidationError {
  field: keyof RegionFormData;
  message: string;
}
```

**Submit Actions**:
1. **Save Region** - Save and redirect to list
2. **Save & Create Datacenters** - Save and navigate to datacenter creation
3. **Cancel** - Discard changes

---

### 4.3 Region Detail View

**Path**: `/infrastructure/regions/:id`

**Component**: `RegionDetailPage.tsx`

```
┌──────────────────────────────────────────────────────────────┐
│ ← US East Region                              [Edit] [Delete]│
└──────────────────────────────────────────────────────────────┘

┌─ Overview ──────────────────────────────────────────────────┐
│ Name: US East (use1)                                        │
│ Group: Americas                                             │
│ Datacenters: 3                                              │
│ Total Agents: 12                                            │
│ Active Agents: 11                                           │
│ Last Updated: 2 hours ago                                   │
└─────────────────────────────────────────────────────────────┘

┌─ Datacenters in this Region ────────────────────────────────┐
│                                                              │
│ ┌─ US-East-1 (use1a) ────────────────────────────────────┐ │
│ │ Agents: 4                                              │ │
│ │ Status: ✓ All healthy                                 │ │
│ │ Last check: 5 mins ago                                │ │
│ │ [View Details] [Manage Agents]                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ US-East-2 (use1b) ────────────────────────────────────┐ │
│ │ Agents: 4                                              │ │
│ │ Status: ✓ All healthy                                 │ │
│ │ Last check: 3 mins ago                                │ │
│ │ [View Details] [Manage Agents]                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ US-East-3 (use1c) ────────────────────────────────────┐ │
│ │ Agents: 4                                              │ │
│ │ Status: ⚠ 1 agent offline                            │ │
│ │ Last check: 1 min ago                                 │ │
│ │ [View Details] [Manage Agents]                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ [+ Add Datacenter]                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─ Health Timeline ───────────────────────────────────────────┐
│ Region Health - Last 24 Hours                               │
│ 100% ▁▂▃▂▁▃▄▃▂▁▃▄▅▄▃▂▁▂▃▄▅▃▂▁▂▃▄▅▆▅▃▂▁  Now             │
│  0%                                                          │
│                                                              │
│ Uptime: 99.8% | Avg Response: 245ms | Errors: 2           │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- Region metadata (name, code, group)
- Statistics (datacenters, agents, health)
- Datacenters list with expandable details
- Health timeline chart
- Quick actions

---

### 4.4 Region Dashboard Card (for Dashboard)

```
┌─────────────────────────────────────┐
│ US East                             │
│ use1 · Americas                     │
├─────────────────────────────────────┤
│ Datacenters    3                    │
│ Agents        12                    │
│ Active        11  (91.7%)           │
│ Health        99.2% ✓               │
├─────────────────────────────────────┤
│ Last 24h: ▃▄▅▃▂▁▂▃ ▄▅▆ ▇█ ▅▄▂▁▂   │
├─────────────────────────────────────┤
│ [View Details]                      │
└─────────────────────────────────────┘
```

---

## 5. React Component Structure (Single Entity - Region)

### File Organization
```
src/main/webapp/app/modules/infrastructure/
├── regions/
│   ├── index.tsx                      # Routing
│   ├── RegionListPage.tsx             # List view
│   ├── RegionFormPage.tsx             # Create/Edit form
│   ├── RegionDetailPage.tsx           # Detail view
│   ├── components/
│   │   ├── RegionListTable.tsx        # Reusable table
│   │   ├── RegionCard.tsx             # Dashboard card
│   │   ├── RegionForm.tsx             # Reusable form
│   │   ├── RegionStats.tsx            # Stats display
│   │   └── HealthTimeline.tsx         # Health chart
│   ├── hooks/
│   │   ├── useRegions.ts              # Data fetching
│   │   ├── useRegionForm.ts           # Form logic
│   │   └── useRegionFilters.ts        # Filter logic
│   ├── store/
│   │   ├── regionSlice.ts             # Redux slice
│   │   └── regionSelectors.ts         # Selectors
│   ├── types/
│   │   └── region.ts                  # TypeScript types
│   ├── services/
│   │   └── regionService.ts           # API calls
│   └── styles/
│       └── region.module.css           # Styles
└── ...other entities...
```

---

## 6. Region Entity - Detailed Component Specifications

### 6.1 Types Definition

**File**: `src/main/webapp/app/modules/infrastructure/regions/types/region.ts`

```typescript
// Core Domain Model
export interface Region {
  id: number;
  name: string;
  regionCode: string;
  groupName?: string;
  description?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Form/DTO
export interface RegionFormData {
  name: string;
  regionCode: string;
  groupName?: string;
  description?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

// Extended view with relationships
export interface RegionDetail extends Region {
  datacenters: Datacenter[];
  totalAgents: number;
  activeAgents: number;
  health: {
    uptime: number;      // percentage
    avgResponseTime: number; // ms
    errorCount: number;
    lastCheck: string;    // ISO timestamp
  };
}

// List/Table representation
export interface RegionRow {
  id: number;
  name: string;
  code: string;
  datacenters: number;
  agents: number;
  activeAgents: number;
  status: 'active' | 'warning' | 'offline';
  health: number;        // percentage
}

// Filters
export interface RegionFilters {
  search?: string;
  status?: 'active' | 'inactive';
  groupName?: string;
  sortBy?: 'name' | 'datacenters' | 'agents' | 'health';
  sortOrder?: 'asc' | 'desc';
}

// Pagination
export interface RegionPagination {
  page: number;
  pageSize: number;
  total: number;
}

// API Response
export interface RegionListResponse {
  content: RegionRow[];
  pagination: RegionPagination;
  filters: RegionFilters;
}
```

---

### 6.2 API Service

**File**: `src/main/webapp/app/modules/infrastructure/regions/services/regionService.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { Region, RegionFormData, RegionDetail, RegionListResponse, RegionFilters } from '../types/region';

const API_BASE = '/api/regions';

export class RegionService {
  private api: AxiosInstance;

  constructor(api: AxiosInstance = axios) {
    this.api = api;
  }

  // List all regions with filters
  async listRegions(
    page: number = 0,
    pageSize: number = 20,
    filters?: RegionFilters
  ): Promise<RegionListResponse> {
    const params = {
      page,
      size: pageSize,
      ...filters,
    };
    const response = await this.api.get<RegionListResponse>(API_BASE, { params });
    return response.data;
  }

  // Get single region with details
  async getRegion(id: number): Promise<RegionDetail> {
    const response = await this.api.get<RegionDetail>(`${API_BASE}/${id}`);
    return response.data;
  }

  // Create new region
  async createRegion(data: RegionFormData): Promise<Region> {
    const response = await this.api.post<Region>(API_BASE, data);
    return response.data;
  }

  // Update existing region
  async updateRegion(id: number, data: Partial<RegionFormData>): Promise<Region> {
    const response = await this.api.put<Region>(`${API_BASE}/${id}`, data);
    return response.data;
  }

  // Partial update (PATCH)
  async partialUpdateRegion(id: number, data: Partial<RegionFormData>): Promise<Region> {
    const response = await this.api.patch<Region>(`${API_BASE}/${id}`, data);
    return response.data;
  }

  // Delete region
  async deleteRegion(id: number): Promise<void> {
    await this.api.delete(`${API_BASE}/${id}`);
  }

  // Bulk operations
  async bulkDelete(ids: number[]): Promise<void> {
    await this.api.delete(API_BASE, { data: { ids } });
  }

  // Get regions by group
  async getRegionsByGroup(groupName: string): Promise<Region[]> {
    const response = await this.api.get<Region[]>(`${API_BASE}`, {
      params: { groupName },
    });
    return response.data;
  }
}
```

---

### 6.3 Redux Slice (State Management)

**File**: `src/main/webapp/app/modules/infrastructure/regions/store/regionSlice.ts`

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RegionService } from '../services/regionService';
import { Region, RegionFormData, RegionDetail, RegionFilters, RegionListResponse } from '../types/region';

interface RegionState {
  // List view
  regions: Region[];
  loading: boolean;
  error?: string;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };

  // Detail view
  currentRegion?: RegionDetail;
  detailLoading: boolean;

  // Form state
  formData?: RegionFormData;
  formErrors: Record<string, string>;
  formSubmitting: boolean;

  // Filters & Search
  filters: RegionFilters;
  search: string;

  // Selections
  selectedRegions: number[];
}

const initialState: RegionState = {
  regions: [],
  loading: false,
  pagination: { page: 0, pageSize: 20, total: 0 },
  detailLoading: false,
  formErrors: {},
  formSubmitting: false,
  filters: {},
  search: '',
  selectedRegions: [],
};

const regionService = new RegionService();

// Async thunks
export const fetchRegions = createAsyncThunk(
  'regions/fetchRegions',
  async ({ page, pageSize, filters }: { page: number; pageSize: number; filters?: RegionFilters }) => {
    const response = await regionService.listRegions(page, pageSize, filters);
    return response;
  }
);

export const fetchRegionDetail = createAsyncThunk(
  'regions/fetchRegionDetail',
  async (id: number) => {
    const response = await regionService.getRegion(id);
    return response;
  }
);

export const createRegion = createAsyncThunk(
  'regions/createRegion',
  async (data: RegionFormData) => {
    const response = await regionService.createRegion(data);
    return response;
  }
);

export const updateRegion = createAsyncThunk(
  'regions/updateRegion',
  async ({ id, data }: { id: number; data: Partial<RegionFormData> }) => {
    const response = await regionService.updateRegion(id, data);
    return response;
  }
);

export const deleteRegion = createAsyncThunk(
  'regions/deleteRegion',
  async (id: number) => {
    await regionService.deleteRegion(id);
    return id;
  }
);

const regionSlice = createSlice({
  name: 'regions',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setFilters: (state, action: PayloadAction<RegionFilters>) => {
      state.filters = action.payload;
    },
    toggleRegionSelection: (state, action: PayloadAction<number>) => {
      const index = state.selectedRegions.indexOf(action.payload);
      if (index > -1) {
        state.selectedRegions.splice(index, 1);
      } else {
        state.selectedRegions.push(action.payload);
      }
    },
    clearSelection: (state) => {
      state.selectedRegions = [];
    },
    setFormData: (state, action: PayloadAction<Partial<RegionFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearFormData: (state) => {
      state.formData = undefined;
      state.formErrors = {};
    },
  },
  extraReducers: (builder) => {
    // Fetch regions
    builder
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.regions = action.payload.content;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch detail
    builder
      .addCase(fetchRegionDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchRegionDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentRegion = action.payload;
      })
      .addCase(fetchRegionDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.error.message;
      });

    // Create region
    builder
      .addCase(createRegion.pending, (state) => {
        state.formSubmitting = true;
        state.formErrors = {};
      })
      .addCase(createRegion.fulfilled, (state, action) => {
        state.formSubmitting = false;
        state.regions.push(action.payload);
        state.formData = undefined;
      })
      .addCase(createRegion.rejected, (state, action) => {
        state.formSubmitting = false;
        state.error = action.error.message;
      });

    // Update region
    builder
      .addCase(updateRegion.fulfilled, (state, action) => {
        const index = state.regions.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.regions[index] = action.payload;
        }
        if (state.currentRegion?.id === action.payload.id) {
          // Fetch updated detail
        }
        state.formData = undefined;
      });

    // Delete region
    builder
      .addCase(deleteRegion.fulfilled, (state, action) => {
        state.regions = state.regions.filter((r) => r.id !== action.payload);
        state.selectedRegions = state.selectedRegions.filter((id) => id !== action.payload);
      });
  },
});

export const {
  setSearch,
  setFilters,
  toggleRegionSelection,
  clearSelection,
  setFormData,
  clearFormData,
} = regionSlice.actions;

export default regionSlice.reducer;
```

---

### 6.4 Custom Hook for Form

**File**: `src/main/webapp/app/modules/infrastructure/regions/hooks/useRegionForm.ts`

```typescript
import { useState, useCallback } from 'react';
import { RegionFormData } from '../types/region';

interface FormErrors {
  [key: string]: string;
}

export const useRegionForm = (onSubmit: (data: RegionFormData) => Promise<void>) => {
  const [formData, setFormData] = useState<RegionFormData>({
    name: '',
    regionCode: '',
    groupName: '',
    description: '',
    timezone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  // Validation rules
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 1 || formData.name.length > 50) {
      newErrors.name = 'Name must be 1-50 characters';
    }

    if (!formData.regionCode || formData.regionCode.length < 1 || formData.regionCode.length > 20) {
      newErrors.regionCode = 'Code must be 1-20 characters';
    }

    if (formData.groupName && formData.groupName.length > 20) {
      newErrors.groupName = 'Group name must be at most 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle field changes
  const handleChange = useCallback(
    (field: keyof RegionFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear error for this field on change
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      setSubmitting(true);
      setSubmitError(undefined);

      try {
        await onSubmit(formData);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Failed to submit form');
      } finally {
        setSubmitting(false);
      }
    },
    [formData, validate, onSubmit]
  );

  // Reset form
  const reset = useCallback(() => {
    setFormData({
      name: '',
      regionCode: '',
      groupName: '',
      description: '',
      timezone: '',
    });
    setErrors({});
    setSubmitError(undefined);
  }, []);

  return {
    formData,
    errors,
    submitting,
    submitError,
    handleChange,
    handleSubmit,
    reset,
    setFormData,
  };
};
```

---

### 6.5 Region List Component

**File**: `src/main/webapp/app/modules/infrastructure/regions/components/RegionListTable.tsx`

```typescript
import React from 'react';
import { Region } from '../types/region';
import '../styles/region.module.css';

interface RegionListTableProps {
  regions: Region[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSelect: (id: number) => void;
  selected: number[];
}

export const RegionListTable: React.FC<RegionListTableProps> = ({
  regions,
  loading,
  onEdit,
  onDelete,
  onSelect,
  selected,
}) => {
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
                checked={selected.length === regions.length}
                onChange={(e) => {
                  // Handle select all
                }}
              />
            </th>
            <th>Name</th>
            <th>Code</th>
            <th>Group</th>
            <th>Datacenters</th>
            <th>Agents</th>
            <th>Health</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => (
            <tr key={region.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(region.id)}
                  onChange={() => onSelect(region.id)}
                />
              </td>
              <td>{region.name}</td>
              <td>{region.regionCode}</td>
              <td>{region.groupName || '-'}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>
                <button onClick={() => onEdit(region.id)} title="Edit">
                  ✎
                </button>
                <button onClick={() => onDelete(region.id)} title="Delete">
                  ✕
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

## 7. Modern UI/UX Practices Applied

### 7.1 Design System

**Typography**:
- Headings: Inter 600, 24px (h1), 20px (h2), 16px (h3)
- Body: Inter 400, 14px
- Code: Mono 400, 12px

**Colors**:
- Primary: `#0066CC` (Blue)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)
- Neutral: `#6B7280` (Gray)

**Spacing**: 4px base unit
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

**Shadows**:
- Small: `0 1px 2px rgba(0,0,0,0.05)`
- Medium: `0 4px 6px rgba(0,0,0,0.1)`
- Large: `0 10px 25px rgba(0,0,0,0.15)`

### 7.2 Interaction Patterns

- **Loading States**: Skeleton screens for lists, spinners for buttons
- **Empty States**: Contextual messages with actions
- **Error Handling**: Toast notifications for transient errors, inline errors for forms
- **Optimistic Updates**: Update UI before server confirmation
- **Pagination**: 20 items per page by default, configurable
- **Search**: Real-time filtering with debouncing

### 7.3 Accessibility

- Semantic HTML (`<button>`, `<form>`, `<table>`)
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management
- Color contrast ratios (WCAG AA)

---

## 8. Implementation Roadmap

### Phase 1: Region Entity (Current)
- ✅ Type definitions
- ✅ API service layer
- ✅ Redux state management
- ✅ List view with filters
- ✅ Create/Edit form
- ✅ Detail view
- 🔄 Testing & documentation

### Phase 2: Datacenter Entity
- Type definitions
- API service
- List/Create/Edit/Detail views
- Relationship to Region

### Phase 3: Agent Management
- Type definitions
- List view with health status
- Agent provisioning UI
- Configuration sync UI
- Agent logs viewer

### Phase 4: Schedule Entity
- Schedule CRUD
- Threshold configuration
- Interval settings

### Phase 5: HttpMonitor (API Tests)
- Monitor creation wizard
- Request builder (headers, body, auth)
- Monitor assignment to datacenters
- Test execution UI

### Phase 6: Real-time Dashboard
- Live heartbeat stream
- Health metrics
- Status indicators
- Alert notifications

---

## 9. File Structure Summary

```
src/main/webapp/app/
├── modules/
│   ├── infrastructure/
│   │   ├── regions/              # PHASE 1: CURRENT
│   │   │   ├── index.tsx
│   │   │   ├── RegionListPage.tsx
│   │   │   ├── RegionFormPage.tsx
│   │   │   ├── RegionDetailPage.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── styles/
│   │   ├── datacenters/          # PHASE 2: TODO
│   │   ├── agents/               # PHASE 3: TODO
│   │   └── index.tsx
│   ├── monitors/                 # PHASE 5: TODO
│   │   ├── schedules/            # PHASE 4: TODO
│   │   ├── httpMonitors/
│   │   └── index.tsx
│   ├── dashboard/                # PHASE 6: TODO
│   │   ├── DashboardPage.tsx
│   │   ├── components/
│   │   └── hooks/
│   └── common/
│       ├── layouts/
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   ├── Header.tsx
│       │   └── ...
│       ├── hooks/
│       └── styles/
├── store/
│   ├── index.ts
│   └── rootReducer.ts
├── types/
│   └── common.ts
└── App.tsx
```

---

## 10. Next Steps

1. **Approval**: Review design and get feedback
2. **Backend API**: Ensure Region endpoints match DTO structure
3. **Component Development**: Start with RegionListPage
4. **Testing**: Unit tests for components and hooks
5. **Documentation**: Add Storybook stories for components

---

**Document End**

Last Updated: November 1, 2025  
Status: Ready for Development  
Phase: Infrastructure-First Design Pattern - Single Entity (Region)
