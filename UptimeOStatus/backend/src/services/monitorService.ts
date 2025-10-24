import * as repository from '../repositories/monitorRepository.js';

export async function getAllMonitorings() {
  return await repository.getAllMonitorings();
}