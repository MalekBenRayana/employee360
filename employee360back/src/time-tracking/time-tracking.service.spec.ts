// time-tracking/time-tracking.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TimeTrackingService } from './time-tracking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeTracking } from './time-tracking.entity';
import { User } from '../user/user.entity';

// Définir des types pour nos mocks de Repository
type MockRepository<T extends object = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;
const mockTimeTrackingRepository = (): MockRepository<TimeTracking> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneOrFail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});
const mockUserRepository = (): MockRepository<User> => ({
  findOne: jest.fn(),
});

describe('TimeTrackingService', () => {
  let service: TimeTrackingService;
  let timeTrackingRepository: MockRepository<TimeTracking>;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeTrackingService,
        {
          provide: getRepositoryToken(TimeTracking),
          useFactory: mockTimeTrackingRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TimeTrackingService>(TimeTrackingService);
    timeTrackingRepository = module.get(
      getRepositoryToken(TimeTracking),
    ) as MockRepository<TimeTracking>;
    userRepository = module.get(
      getRepositoryToken(User),
    ) as MockRepository<User>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processExternalTimeTracking', () => {
    it('should process external time tracking data for userId 15 and save', async () => {
      // Mock des données externes avec userId 15
      const externalData = [
        {
          userId: 15,
          retards: 0,
          debut: '2025-05-16',
          fin: '2025-05-16',
          heures: 8,
        },
      ];

      // Mock de l'utilisateur retourné par le userRepository pour userId 15
      const mockUser15 = { id: 15 } as User;
      userRepository.findOne!.mockResolvedValueOnce(mockUser15); // Use non-null assertion

      // Mock de la création et de la sauvegarde de l'entité TimeTracking
      const mockTimeTracking1 = {
        id: 201,
        userId: externalData[0].userId,
        nbreRetards: externalData[0].retards || 0,
        startDate: new Date(externalData[0].debut),
        endDate: new Date(externalData[0].fin),
        heuresRequises: externalData[0].heures,
        user: mockUser15,
      } as TimeTracking;
      timeTrackingRepository.create!.mockReturnValueOnce(mockTimeTracking1); // Use non-null assertion
      timeTrackingRepository.save!.mockResolvedValue([mockTimeTracking1]); // Use non-null assertion

      // Appel de la méthode à tester
      const result = await service.processExternalTimeTracking(externalData);

      // Assertions
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 15 },
      });

      expect(timeTrackingRepository.create).toHaveBeenCalledTimes(1);
      expect(timeTrackingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 15,
          nbreRetards: 0,
          startDate: new Date('2025-05-16T00:00:00.000Z'),
          endDate: new Date('2025-05-16T00:00:00.000Z'),
          heuresRequises: 8,
          user: mockUser15,
        }),
      );

      expect(timeTrackingRepository.save).toHaveBeenCalledWith([
        mockTimeTracking1,
      ]);
      expect(result).toEqual([mockTimeTracking1]);
    });

    it('should handle the case where userId 15 is not found', async () => {
      const externalData = [
        { userId: 15, debut: '...', fin: '...', heures: 5 },
      ];
      userRepository.findOne!.mockResolvedValueOnce(undefined); // Use non-null assertion

      const result = await service.processExternalTimeTracking(externalData);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 15 },
      });
      expect(timeTrackingRepository.create).not.toHaveBeenCalled();
      expect(timeTrackingRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new time tracking entry', async () => {
      const timeTrackingData: Partial<TimeTracking> = {
        userId: 1,
        startDate: new Date(),
        endDate: new Date(),
        heuresRequises: 8,
      };
      const mockCreatedTimeTracking = {
        id: 1,
        ...timeTrackingData,
      } as TimeTracking;
      timeTrackingRepository.create!.mockReturnValue(mockCreatedTimeTracking); // Use non-null assertion
      timeTrackingRepository.save!.mockResolvedValue(mockCreatedTimeTracking); // Use non-null assertion

      const result = await service.create(timeTrackingData);
      expect(timeTrackingRepository.create).toHaveBeenCalledWith(
        timeTrackingData,
      );
      expect(timeTrackingRepository.save).toHaveBeenCalledWith(
        mockCreatedTimeTracking,
      );
      expect(result).toEqual(mockCreatedTimeTracking);
    });
  });

  describe('findAll', () => {
    it('should return all time tracking entries', async () => {
      const mockTimeTrackings: TimeTracking[] = [
        {
          id: 1,
          userId: 1,
          startDate: new Date(),
          endDate: new Date(),
          heuresRequises: 8,
        } as TimeTracking,
        {
          id: 2,
          userId: 2,
          startDate: new Date(),
          endDate: new Date(),
          heuresRequises: 7,
        } as TimeTracking,
      ];
      timeTrackingRepository.find!.mockResolvedValue(mockTimeTrackings); // Use non-null assertion

      const result = await service.findAll();
      expect(timeTrackingRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
      });
      expect(result).toEqual(mockTimeTrackings);
    });
  });

  describe('findOne', () => {
    it('should return a time tracking entry by id', async () => {
      const mockTimeTracking = {
        id: 1,
        userId: 1,
        startDate: new Date(),
        endDate: new Date(),
        heuresRequises: 8,
      } as TimeTracking;
      timeTrackingRepository.findOneOrFail!.mockResolvedValue(mockTimeTracking); // Use non-null assertion

      const result = await service.findOne(1);
      expect(timeTrackingRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(result).toEqual(mockTimeTracking);
    });

    it('should throw NotFoundException if time tracking entry is not found', async () => {
      timeTrackingRepository.findOneOrFail!.mockRejectedValue(
        new Error('Not Found'),
      ); // Use non-null assertion
      await expect(service.findOne(1)).rejects.toThrow('Not Found');
    });
  });

  describe('update', () => {
    it('should update a time tracking entry by id', async () => {
      const updateData: Partial<TimeTracking> = { heuresRequises: 10 };
      const mockUpdatedTimeTracking = {
        id: 1,
        userId: 1,
        startDate: new Date(),
        endDate: new Date(),
        heuresRequises: 10,
      } as TimeTracking;
      timeTrackingRepository.update!.mockResolvedValue({ affected: 1 } as any); // Use non-null assertion
      timeTrackingRepository.findOneOrFail!.mockResolvedValue(
        mockUpdatedTimeTracking,
      ); // Use non-null assertion

      const result = await service.update(1, updateData);
      expect(timeTrackingRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(timeTrackingRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(result).toEqual(mockUpdatedTimeTracking);
    });
  });

  describe('remove', () => {
    it('should remove a time tracking entry by id', async () => {
      timeTrackingRepository.delete!.mockResolvedValue({ affected: 1 } as any); // Use non-null assertion
      await service.remove(1);
      expect(timeTrackingRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
