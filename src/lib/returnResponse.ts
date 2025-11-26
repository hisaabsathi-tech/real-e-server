import { Response } from "express";
import logger from "@/logger/logger";

interface SuccessResponseOptions {
  message?: string;
  data?: any;
  statusCode?: number;
}

interface ErrorResponseOptions {
  message?: string;
  error?: string;
  statusCode?: number;
  details?: any;
}

interface PaginationResponseOptions {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  items: any[];
  statusCode?: number;
}

export class ReturnResponse {
  /**
   * Send a successful response
   */
  static success(
    res: Response,
    options: SuccessResponseOptions = {}
  ): Response {
    const {
      message = "Operation completed successfully",
      data = null,
      statusCode = 200,
    } = options;

    const response: any = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response
   */
  static error(res: Response, options: ErrorResponseOptions = {}): Response {
    const {
      message = "An error occurred",
      error = message,
      statusCode = 500,
      details,
    } = options;

    const response: any = {
      success: false,
      error,
    };

    if (details) {
      response.details = details;
    }

    // Log error for debugging
    logger.error(`Error Response [${statusCode}]:`, {
      error,
      details,
      stack: new Error().stack,
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send a paginated response
   */
  static paginated(
    res: Response,
    options: PaginationResponseOptions
  ): Response {
    const {
      page,
      limit,
      totalPages,
      totalItems,
      items,
      statusCode = 200,
    } = options;

    const response = {
      success: true,
      page,
      limit,
      totalPages,
      totalItems,
      items,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201)
   */
  static created(
    res: Response,
    options: Omit<SuccessResponseOptions, "statusCode"> = {}
  ): Response {
    return this.success(res, {
      ...options,
      message: options.message || "Resource created successfully",
      statusCode: 201,
    });
  }

  /**
   * Send a not found response (404)
   */
  static notFound(
    res: Response,
    message: string = "Resource not found"
  ): Response {
    return this.error(res, {
      message,
      error: message,
      statusCode: 404,
    });
  }

  /**
   * Send a bad request response (400)
   */
  static badRequest(
    res: Response,
    message: string = "Invalid request data",
    details?: any
  ): Response {
    return this.error(res, {
      message,
      error: message,
      statusCode: 400,
      details,
    });
  }

  /**
   * Send an unauthorized response (401)
   */
  static unauthorized(
    res: Response,
    message: string = "Unauthorized access"
  ): Response {
    return this.error(res, {
      message,
      error: message,
      statusCode: 401,
    });
  }

  /**
   * Send a forbidden response (403)
   */
  static forbidden(
    res: Response,
    message: string = "Access forbidden"
  ): Response {
    return this.error(res, {
      message,
      error: message,
      statusCode: 403,
    });
  }

  /**
   * Send an internal server error response (500)
   */
  static internalError(
    res: Response,
    message: string = "Internal server error",
    details?: any
  ): Response {
    return this.error(res, {
      message,
      error: message,
      statusCode: 500,
      details,
    });
  }

  /**
   * Handle database or validation errors automatically
   */
  static handleError(
    res: Response,
    error: any,
    context: string = "Operation"
  ): Response {
    // Log the full error for debugging
    logger.error(`Error in ${context}:`, error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.startsWith("Validation failed")) {
        return this.badRequest(res, "Invalid request data", error.message);
      }

      // Prisma unique constraint violation
      if (error.message.includes("Unique constraint")) {
        return this.badRequest(res, "Resource already exists");
      }

      // Prisma foreign key constraint
      if (error.message.includes("Foreign key constraint")) {
        return this.badRequest(res, "Referenced resource not found");
      }
    }

    // Default to internal server error
    return this.internalError(res, `Failed to ${context.toLowerCase()}`);
  }
}
