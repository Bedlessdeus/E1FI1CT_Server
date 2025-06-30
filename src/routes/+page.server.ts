import {v4 as uuid } from 'uuid';

const generateItem = (amount: number = 1) => {
    amount++;
    const items = [];
    for (let i = 1; i < amount; i++) {
        items.push({ id: uuid(), title: `Item ${i}`, description: `This is the ${i} item.` });
    }
    return items;
}

export const load = () => {
    const items = generateItem(10);

    return {
        items
    };
}