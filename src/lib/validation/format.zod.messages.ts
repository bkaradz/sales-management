import type { SafeParseError } from 'zod';

export const zodErrorMessagesMap = <T>(results: SafeParseError<T>) => {
	if (!results.success) {
		const formatErrors = results.error.format();

		const errorsMap = new Map<string, any>(Object.entries(formatErrors));

		const newErrorMap = new Map();

		for (const [key, value] of errorsMap.entries()) {
			if (key !== '_errors') {
				newErrorMap.set(key, value?._errors.join(', ') || '');
			}
		}

		return newErrorMap;
	}
};
