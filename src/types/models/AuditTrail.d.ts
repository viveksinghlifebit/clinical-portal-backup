declare namespace AuditTrail {
  interface Attributes extends Mongoose.Document {
    level: import('enums').AuditLevel;
    message: string;
    requestId: string;
    actionOwner: Mongoose.ObjectId;
    metadata: ESInfoMetadata;
    timestamp: number;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Document extends Attributes, Mongoose.Document {
    view(): View;
  }

  interface Model extends Mongoose.Model<Document> {
    //
  }

  interface View {
    _id: string;
    level: AuditTrail.Attributes['level'];
    requestId: AuditTrail.Attributes['requestId'];
    message: AuditTrail.Attributes['message'];
    timestamp: AuditTrail.Attributes['timestamp'];
    metadata: AuditTrail.Attributes['metadata'];
    actionOwner: string;
  }

  interface ESInfoMetadata {
    request?: {
      method: string;
      url: string;
      body?: string | Record<string, unknown>;
      ip: string;
    };
    response?: {
      statusCode: number;
      responseTime: number;
      fullHeaders: Record<string, unknown>;
      body?: Record<string, unknown>;
    };
    error?: string;
  }

  interface InfoLog {
    level: import('enums').AuditLevel;
    message: string;
    requestId: string;
    actionOwner: string;
    metadata: ESInfoMetadata;
  }
}
