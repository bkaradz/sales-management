const normalizePhone = (phone: string) => {
	return phone.split(',').map((data: string) => {
		let remNonNumeric = data.replace(/[^\d+]+/g, '');
		remNonNumeric;
		if (remNonNumeric[0] === '0') {
			remNonNumeric = '00263' + remNonNumeric.slice(1);
		}
		remNonNumeric;
		const zeros = remNonNumeric.replace(/\+/g, '00');
		return { phone: zeros };
	});
};

export default normalizePhone;
