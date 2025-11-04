import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PlanDocument } from '../database/schemas/plan.schema';
import { Model } from 'mongoose';
import { Plan } from '../../domain/entities/plan.entity';
import { PlanRepository } from '../../domain/repositories/plan.repository';
import { parse } from 'path';

@Injectable()
export class PlanMongoRepository implements PlanRepository {
  constructor(
    @InjectModel(PlanDocument.name)
    private readonly model: Model<PlanDocument>,
  ) {}

  async findByPlanId(planId: number): Promise<Plan | null> {
    const doc = await this.model.findOne({ planId });
    return doc
      ? new Plan(
          doc._id?.toString() || '',
          doc.name,
          doc.tokensPerMonth,
          parseInt(doc.priceUsd.toString()),
          doc.features,
          doc.isActive,
          doc.planId,
        )
      : null;
  }

  async findById(id: string): Promise<Plan | null> {
    const doc = await this.model.findById(id);
    return doc
      ? new Plan(
          doc._id?.toString() || '',
          doc.name,
          doc.tokensPerMonth,
          parseInt(doc.priceUsd.toString()),
          doc.features,
          doc.isActive,
          doc.planId,
        )
      : null;
  }

  async findAllActive(): Promise<Plan[]> {
    const docs = await this.model.find({ isActive: true });
    return docs.map(
      doc =>
        new Plan(
          doc._id?.toString() || '',
          doc.name,
          doc.tokensPerMonth,
          parseInt(doc.priceUsd.toString()),
          doc.features,
          doc.isActive,
          doc.planId,
        ),
    );
  }
}
