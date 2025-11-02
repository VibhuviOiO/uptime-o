import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { JhiItemCount, JhiPagination, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faBuilding, faPencil, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities } from './datacenter.reducer';
import DatacenterEditModal from 'app/modules/home/components/DatacenterEditModal';
import DatacenterDeleteModal from 'app/modules/home/components/DatacenterDeleteModal';
import '../entity.scss';

export const Datacenter = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDatacenterId, setSelectedDatacenterId] = useState<number | null>(null);

  const datacenterList = useAppSelector(state => state.datacenter.entities);
  const loading = useAppSelector(state => state.datacenter.loading);
  const totalItems = useAppSelector(state => state.datacenter.totalItems);

  const getAllEntities = () => {
    dispatch(
      getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      }),
    );
  };

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (pageLocation.search !== endURL) {
      navigate(`${pageLocation.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  useEffect(() => {
    const params = new URLSearchParams(pageLocation.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [pageLocation.search]);

  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  const handleEditClick = (datacenterId: number) => {
    setSelectedDatacenterId(datacenterId);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (datacenterId: number) => {
    setSelectedDatacenterId(datacenterId);
    setDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedDatacenterId(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDatacenterId(null);
  };

  const handleSaveSuccess = () => {
    // Refresh the list after successful save
    sortEntities();
  };

  const getSortIconByFieldName = (fieldName: string) => {
    const sortFieldName = paginationState.sort;
    const order = paginationState.order;
    if (sortFieldName !== fieldName) {
      return faSort;
    }
    return order === ASC ? faSortUp : faSortDown;
  };

  return (
    <div className="datacenters-page">
      <div className="datacenters-header">
        <div className="header-content">
          <h1 id="datacenter-heading" data-cy="DatacenterHeading">
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Datacenters
          </h1>
        </div>
        <div className="header-actions">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading} outline>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </Button>
        </div>
      </div>

      {datacenterList && datacenterList.length > 0 ? (
        <>
          <div className="smart-table-wrapper">
            <table className="smart-table" data-cy="entityTable">
              <thead>
                <tr>
                  <th className="sortable" onClick={sort('id')}>
                    <span className="th-content">
                      ID
                      <FontAwesomeIcon icon={getSortIconByFieldName('id')} className="ms-1" />
                    </span>
                  </th>
                  <th className="sortable" onClick={sort('code')}>
                    <span className="th-content">
                      Code
                      <FontAwesomeIcon icon={getSortIconByFieldName('code')} className="ms-1" />
                    </span>
                  </th>
                  <th className="sortable" onClick={sort('name')}>
                    <span className="th-content">
                      Name
                      <FontAwesomeIcon icon={getSortIconByFieldName('name')} className="ms-1" />
                    </span>
                  </th>
                  <th>
                    <span className="th-content">Region</span>
                  </th>
                  <th className="actions-column">
                    <span className="th-content">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {datacenterList.map((datacenter, i) => (
                  <tr key={`entity-${i}`} className="table-row">
                    <td className="id-cell">
                      <span className="badge bg-secondary">{datacenter.id}</span>
                    </td>
                    <td className="code-cell">
                      <code className="code-badge">{datacenter.code}</code>
                    </td>
                    <td className="name-cell">
                      <strong>{datacenter.name}</strong>
                    </td>
                    <td className="region-cell">
                      {datacenter.region ? (
                        <Link to={`/region/${datacenter.region.id}`} className="region-link">
                          {datacenter.region.name}
                        </Link>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn btn-edit"
                          title="Edit"
                          onClick={() => handleEditClick(datacenter.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </button>
                        <button
                          className="action-btn btn-delete"
                          title="Delete"
                          onClick={() => handleDeleteClick(datacenter.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalItems ? (
            <div className="table-pagination">
              <div className="pagination-info">
                <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
              </div>
              <div className="pagination-controls">
                <JhiPagination
                  activePage={paginationState.activePage}
                  onSelect={handlePagination}
                  maxButtons={5}
                  itemsPerPage={paginationState.itemsPerPage}
                  totalItems={totalItems}
                />
              </div>
            </div>
          ) : (
            ''
          )}
        </>
      ) : (
        !loading && <div className="alert alert-warning">No Datacenters found</div>
      )}

      <DatacenterEditModal
        isOpen={editModalOpen}
        toggle={handleCloseEditModal}
        datacenterId={selectedDatacenterId}
        onSave={handleSaveSuccess}
      />
      <DatacenterDeleteModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        datacenterId={selectedDatacenterId}
        onDelete={handleSaveSuccess}
      />
    </div>
  );
};

export default Datacenter;
