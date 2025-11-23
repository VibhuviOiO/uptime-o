import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, Card, CardBody, CardHeader, Table, Badge, FormText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';

interface StatusPageItemsModalProps {
  statusPage: any;
  toggle: () => void;
}

export const StatusPageItemsModal: React.FC<StatusPageItemsModalProps> = ({ statusPage, toggle }) => {
  const [items, setItems] = useState<any[]>([]);
  const [httpMonitors, setHttpMonitors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('HTTP');
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [rootParents, setRootParents] = useState<any[]>([]);

  useEffect(() => {
    loadItems();
    loadAvailableItems();
    if (!statusPage.isPublic) {
      loadDependencies();
    }
  }, [statusPage.id]);

  const loadItems = async () => {
    try {
      const response = await axios.get(`/api/status-pages/${statusPage.id}/items`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableItems = async () => {
    try {
      const [httpRes, servicesRes, instancesRes] = await Promise.all([
        axios.get('/api/http-monitors'),
        axios.get('/api/services'),
        axios.get('/api/instances'),
      ]);
      setHttpMonitors(httpRes.data);
      setServices(servicesRes.data);
      setInstances(instancesRes.data);
    } catch (error) {
      console.error('Failed to load available items');
    }
  };

  const loadDependencies = async () => {
    try {
      const response = await axios.get('/api/status-dependencies');
      setDependencies(response.data);

      const allParents = new Set(response.data.map((d: any) => `${d.parentType}-${d.parentId}`));
      const allChildren = new Set(response.data.map((d: any) => `${d.childType}-${d.childId}`));

      const roots = response.data
        .filter((d: any) => {
          const key = `${d.parentType}-${d.parentId}`;
          return allParents.has(key) && !allChildren.has(key);
        })
        .map((d: any) => ({
          type: d.parentType,
          id: d.parentId,
          key: `${d.parentType}-${d.parentId}`,
        }));

      const uniqueRoots = Array.from(new Map(roots.map(r => [r.key, r])).values());
      setRootParents(uniqueRoots);
    } catch (error) {
      console.error('Failed to load dependencies');
    }
  };

  const handleAdd = async () => {
    if (!selectedItemId) {
      toast.error('Please select an item');
      return;
    }

    if (statusPage.isPublic && selectedType !== 'HTTP') {
      toast.error('Public status pages can only show HTTP monitors');
      return;
    }

    try {
      await axios.post('/api/status-page-items', {
        statusPageId: statusPage.id,
        itemType: selectedType,
        itemId: selectedItemId,
      });
      toast.success('Item added successfully');
      setSelectedItemId(undefined);
      loadItems();
    } catch (error: any) {
      if (error.response?.data?.message === 'error.itemexists') {
        toast.error('This item is already added to the status page');
      } else {
        toast.error('Failed to add item');
      }
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await axios.delete(`/api/status-page-items/${itemId}`);
      toast.success('Item removed successfully');
      loadItems();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const getAvailableItems = () => {
    if (statusPage.isPublic) {
      return httpMonitors.map(m => ({ id: m.id, name: m.name, type: 'HTTP' }));
    }

    return rootParents.map(root => {
      const name = getItemName(root.type, root.id);
      return { id: root.id, name: `${root.type}: ${name}`, type: root.type };
    });
  };

  const getItemName = (type: string, id: number) => {
    let itemList = [];
    switch (type) {
      case 'HTTP':
        itemList = httpMonitors;
        break;
      case 'SERVICE':
        itemList = services;
        break;
      case 'INSTANCE':
        itemList = instances;
        break;
      default:
        itemList = [];
    }
    const item = itemList.find((i: any) => i.id === id);
    return item ? item.name : `Unknown (${id})`;
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'HTTP':
        return 'primary';
      case 'SERVICE':
        return 'success';
      case 'INSTANCE':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Manage Items - {statusPage.name}</h5>
          <Button color="secondary" size="sm" onClick={toggle}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {statusPage.isPublic && <div className="alert alert-info small mb-3">Public status pages can only display HTTP monitors</div>}

        <Form
          onSubmit={e => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <div className="row g-2 mb-3">
            <div className="col-md-10">
              <FormGroup className="mb-0">
                <Label for="itemId" className="small">
                  {statusPage.isPublic ? 'HTTP Monitor' : 'Root Dependency (Parent)'}
                </Label>
                <Input
                  type="select"
                  id="itemId"
                  value={selectedItemId || ''}
                  onChange={e => {
                    const selected = getAvailableItems().find((item: any) => item.id === Number(e.target.value));
                    setSelectedItemId(Number(e.target.value));
                    if (selected?.type) {
                      setSelectedType(selected.type);
                    }
                  }}
                  bsSize="sm"
                >
                  <option value="">Select...</option>
                  {getAvailableItems().map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Input>
                {!statusPage.isPublic && rootParents.length === 0 && (
                  <small className="text-muted">No root dependencies found. Create dependencies first in Service Dependencies.</small>
                )}
              </FormGroup>
            </div>
            <div className="col-md-2">
              <Label className="small d-block">&nbsp;</Label>
              <Button color="primary" size="sm" type="submit" block>
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Add
              </Button>
            </div>
          </div>
        </Form>

        <hr />

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-muted text-center">No items added yet</p>
        ) : (
          <Table size="sm" striped>
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th style={{ width: '50px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <Badge color={getTypeBadgeColor(item.itemType)}>{item.itemType}</Badge>
                  </td>
                  <td>{getItemName(item.itemType, item.itemId)}</td>
                  <td>
                    <Button color="link" size="sm" onClick={() => handleDelete(item.id)} style={{ padding: 0, color: '#dc3545' }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};
