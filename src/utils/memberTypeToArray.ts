interface memberType {
    value: string,
    status: boolean,
    isLeader: boolean,
    gender: 1 | 2
}

const memberTypeToArray = (src: memberType[]) => {
    const array: memberType[] = []
    for (const i of src) {
        if (!i.status || i.isLeader) continue;
        array.push(i);
    }

    return array;
}

export default memberTypeToArray;