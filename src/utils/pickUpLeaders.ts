interface memberType {
    value: string,
    status: boolean,
	isLeader: boolean,
	gender: 1 | 2
}
const pickUpLeaders = (male: memberType[], female: memberType[]): memberType[] => {
	const leaders: memberType[] = [];
	male.forEach(({value, status, isLeader, gender}, index)=>{
		if (status&&isLeader) leaders.push({value, isLeader, status, gender})
	})
	female.forEach(({value, status, isLeader, gender})=>{
		if (status&&isLeader) leaders.push({value, isLeader, status, gender})
	})
	return leaders
}

export default pickUpLeaders