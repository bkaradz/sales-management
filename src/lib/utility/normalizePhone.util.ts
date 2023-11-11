export const normalizePhone = (phone: string) => {
	return phone.split(',').map((data: string) => data.trim())
};

export const normalizeEmail = (email: string) => {
	return email.split(',').map((data: string) => data.trim());
};

export const normalizeAddress = (email: string) => {
	return email.split(',').map((data: string) => data.trim());
};


