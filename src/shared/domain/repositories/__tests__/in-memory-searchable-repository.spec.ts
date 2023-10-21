import { filter } from 'rxjs';
import { Entity } from '../../entities/entity';
import { InMemorySearchableRepository } from '../in-memory-searchable-repository';
import { SearchParams, SearchResult } from '../searchable-repository-contracts';

type StubEntityProps = {
  name: string;
  price: number;
};

class StubEntity extends Entity<StubEntityProps> { }
class StubInMemorySearchableRepository extends InMemorySearchableRepository<StubEntity> {
  sortableFields: string[] = ['name'];
  protected async applyFilter(
    items: StubEntity[],
    filter: string | null,
  ): Promise<StubEntity[]> {
    if (!filter) {
      return items;
    }
    return items.filter(item => {
      return item._props.name.toLowerCase().includes(filter.toLowerCase());
    });
  }
}

describe('InMemorySearchableRepository Unit Tests', () => {
  let sut: StubInMemorySearchableRepository;

  beforeEach(() => {
    sut = new StubInMemorySearchableRepository();
  });

  describe('applyFilter method', () => {
    it('should no filter items when filter param is null', async () => {
      const items = [new StubEntity({ name: 'test', price: 10 })];
      const spyFilter = jest.spyOn(items, 'filter');
      const itemFiltered = await sut['applyFilter'](items, null);
      expect(itemFiltered).toStrictEqual(items);
      expect(spyFilter).not.toHaveBeenCalled();
    });

    it('should filter using filter param', async () => {
      const items = [
        new StubEntity({ name: 'test', price: 10 }),
        new StubEntity({ name: 'TEST', price: 10 }),
        new StubEntity({ name: 'fake', price: 10 }),
      ];
      const spyFilter = jest.spyOn(items, 'filter');
      let itemFiltered = await sut['applyFilter'](items, 'TEST');
      expect(spyFilter).toHaveBeenCalledTimes(1);
      expect(itemFiltered).toStrictEqual([items[0], items[1]]);

      itemFiltered = await sut['applyFilter'](items, 'test');
      expect(spyFilter).toHaveBeenCalledTimes(2);
      expect(itemFiltered).toStrictEqual([items[0], items[1]]);

      itemFiltered = await sut['applyFilter'](items, 'no items');
      expect(spyFilter).toHaveBeenCalledTimes(3);
      expect(itemFiltered).toHaveLength(0);
    });
  });
  describe('applySort method', () => {
    it('should no sort items', async () => {
      const items = [
        new StubEntity({ name: 'B', price: 10 }),
        new StubEntity({ name: 'A', price: 10 }),
      ];
      let itemsSorted = await sut['applySort'](items, null, null);
      expect(itemsSorted).toStrictEqual(items);

      itemsSorted = await sut['applySort'](items, 'price', 'asc');
      expect(itemsSorted).toStrictEqual(items);
    });

    it('should sort items', async () => {
      const items = [
        new StubEntity({ name: 'B', price: 10 }),
        new StubEntity({ name: 'A', price: 10 }),
        new StubEntity({ name: 'C', price: 10 }),
      ];
      let itemsSorted = await sut['applySort'](items, 'name', 'asc');
      expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]]);

      itemsSorted = await sut['applySort'](items, 'name', 'desc');
      expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]]);

      itemsSorted = await sut['applySort'](items, 'name', 'no');
      expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]]);

      itemsSorted = await sut['applySort'](items, 'name', null);
      expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]]);
    });
  });
  describe('applyPaginate method', () => {
    it('should sort items', async () => {
      const items = [
        new StubEntity({ name: 'a', price: 10 }),
        new StubEntity({ name: 'b', price: 10 }),
        new StubEntity({ name: 'c', price: 10 }),
        new StubEntity({ name: 'd', price: 10 }),
        new StubEntity({ name: 'e', price: 10 }),
      ];
      let itemsPaginated = await sut['applyPaginate'](items, 1, 2);
      expect(itemsPaginated).toStrictEqual([items[0], items[1]]);

      itemsPaginated = await sut['applyPaginate'](items, 2, 2);
      expect(itemsPaginated).toStrictEqual([items[2], items[3]]);

      itemsPaginated = await sut['applyPaginate'](items, 3, 2);
      expect(itemsPaginated).toStrictEqual([items[4]]);

      itemsPaginated = await sut['applyPaginate'](items, 4, 2);
      expect(itemsPaginated).toStrictEqual([]);
    });
  });
  describe('search method', () => {
    it('should apply only pagination when the other params are null', async () => {
      const entity = new StubEntity({ name: 'a', price: 10 });
      const items = Array(16).fill(entity);

      sut.items = items;

      const params = await sut.search(new SearchParams());
      expect(params).toStrictEqual(
        new SearchResult({
          items: Array(15).fill(entity),
          total: 16,
          currentPage: 1,
          perPage: 15,
          sort: null,
          sortDir: null,
          filter: null,
        }),
      );
    });

    it('should apply paginate and filter', async () => {
      const items = [
        new StubEntity({ name: 'test', price: 10 }),
        new StubEntity({ name: 'a', price: 10 }),
        new StubEntity({ name: 'TEST', price: 10 }),
        new StubEntity({ name: 'TesT', price: 10 }),
      ];

      sut.items = items;

      let params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          filter: 'test',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[0], items[2]],
          total: 3,
          currentPage: 1,
          perPage: 2,
          sort: null,
          sortDir: null,
          filter: 'test',
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          filter: 'test',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[3]],
          total: 3,
          currentPage: 2,
          perPage: 2,
          sort: null,
          sortDir: null,
          filter: 'test',
        }),
      );
    });

    it('should apply paginate and sort', async () => {
      const items = [
        new StubEntity({ name: 'b', price: 10 }),
        new StubEntity({ name: 'a', price: 10 }),
        new StubEntity({ name: 'd', price: 10 }),
        new StubEntity({ name: 'c', price: 10 }),
      ];

      sut.items = items;

      let params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[2], items[3]],
          total: 4,
          currentPage: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: null,
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[0], items[1]],
          total: 4,
          currentPage: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: null,
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[1], items[0]],
          total: 4,
          currentPage: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: null,
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[3], items[2]],
          total: 4,
          currentPage: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: null,
        }),
      );
    });

    it('should search using paginate and filter', async () => {
      const items = [
        new StubEntity({ name: 'test', price: 10 }),
        new StubEntity({ name: 'a', price: 10 }),
        new StubEntity({ name: 'TEST', price: 10 }),
        new StubEntity({ name: 'e', price: 10 }),
        new StubEntity({ name: 'TesT', price: 10 }),
      ];

      sut.items = items;

      let params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: 'test',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[0], items[4]],
          total: 3,
          currentPage: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: 'test',
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: 'test',
        }),
      );
      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[2]],
          total: 3,
          currentPage: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: 'test',
        }),
      );
    });
  });
});
