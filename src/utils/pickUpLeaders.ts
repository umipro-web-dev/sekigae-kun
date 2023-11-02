interface memberType {
    value: string,
    status: boolean,
	isLeader: boolean
}
const pickUpLeaders = (first: memberType[], second: memberType[]): string[] => {
	const leaders: string[] = [];
	first.forEach(({value, status, isLeader})=>{
		if (status&&isLeader) leaders.push(value)
	})
	second.forEach(({value, status, isLeader})=>{
		if (status&&isLeader) leaders.push(value)
	})
	return leaders
}

export default pickUpLeaders