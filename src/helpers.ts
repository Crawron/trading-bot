export function findRepetiton<T>(array: T[]): T[] {
	const found: T[] = []

	// oldschool walking for loop
	for (let i = 0; i < array.length - 1; i++) {
		for (let j = i + 1; j < array.length; j++)
			if (array[i] === array[j]) {
				found.push(array[i])
				break
			}
	}

	return found
}

// https://bost.ocks.org/mike/shuffle/
export function shuffleArray<T>([...array]: T[]): T[] {
	for (let m = array.length; m > 0; m--) {
		const i = Math.floor(Math.random() * m - 1)

		const t = array[m]
		array[m] = array[i]
		array[i] = t
	}

	return array
}

/** checks if A is a subset of B */
export function checkSubset<T>(arrA: T[], [...arrB]: T[]): boolean {
	for (const elem of arrA) {
		const i = arrB.findIndex((e) => elem === e)
		if (i >= 0) arrB.splice(i, 1)
		else return false
	}
	return true
}

export function arrayDiff<T>([...arrA]: T[], arrB: T[]): T[] {
	for (const elem of arrB) {
		const i = arrA.findIndex((e) => elem === e)
		if (i >= 0) arrA.splice(i, 1)
	}

	return arrA
}
