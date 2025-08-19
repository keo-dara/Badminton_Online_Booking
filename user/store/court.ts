import { getCourtById, getCourts } from '~/api/court';
import type { PaginationOption } from '~/interfaces/pagination.interface';
import type { Court, CourtDetail } from '~/models/court';

export const useCourtStore = defineStore({
  id: 'court-store',
  state: () => ({
    courts: undefined as Court[] | undefined,
    courtDetail: undefined as CourtDetail | undefined
  }),
  getters: {
    getCourtList: state => state.courts,
    getCourtDetail: state => state.courtDetail
  },
  actions: {
    async fetchCourts() {
      try {
        const { data } = await getCourts({
          page: 1,
          take: 10
        } as PaginationOption);
        this.courts = data;
      } catch (e: any) {}
    },
    async fetchCourtDetail(id: string, bookingDate: number) {
      try {
        this.courtDetail = await getCourtById(id, bookingDate);
      } catch (e: any) {}
    }
  }
});
