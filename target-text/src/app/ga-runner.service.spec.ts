import { TestBed, inject } from '@angular/core/testing';

import { GaRunnerService } from './ga-runner.service';

describe('GaRunnerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GaRunnerService]
    });
  });

  it('should be created', inject([GaRunnerService], (service: GaRunnerService) => {
    expect(service).toBeTruthy();
  }));
});
