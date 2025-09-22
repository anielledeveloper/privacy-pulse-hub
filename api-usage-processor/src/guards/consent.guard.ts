import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConsentsService } from '../consents/consents.service';

@Injectable()
export class ConsentGuard implements CanActivate {
  constructor(private readonly consentsService: ConsentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Extract deviceId from request body or headers
    let deviceId: string | undefined;
    
    if (request.body && request.body.deviceId) {
      deviceId = request.body.deviceId;
    } else if (request.headers['x-device-id']) {
      deviceId = request.headers['x-device-id'] as string;
    } else if (request.query.deviceId) {
      deviceId = request.query.deviceId as string;
    }

    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    // Check if device has active consent
    try {
      const consent = await this.consentsService.getConsentByDeviceId(deviceId);
      
      if (!consent) {
        throw new UnauthorizedException('Active consent required for this endpoint');
      }

      // Add consent info to request for use in controllers
      request['consentInfo'] = consent;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to validate consent');
    }
  }
}
