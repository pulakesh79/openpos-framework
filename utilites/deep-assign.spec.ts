import { deepAssign } from './deep-assign';

describe( 'deepAssign', () => {

    it( 'Should return the string if passed a string', () => {
        const src = 'Hi';
        let target = 'Blah';
        target = deepAssign(target, src);
        expect(target).toBe('Hi');
    });

    it( 'Should return the number if passed a number', () => {
        const src = 4;
        let target = 5;
        target = deepAssign(target, src);
        expect(target).toBe(4);
    });

    it( 'Should return the boolean if passed a boolean', () => {
        const src = false;
        let target = true;
        target = deepAssign(target, src);
        expect(target).toBe(false);
    });

    it( 'Should return the src object if target is undefined', () => {
        const src = { prop1: 'blah', prop2: 4 };
        let target;
        target = deepAssign( target, src );
        expect(target).toEqual(src);
    });

    it( 'Should return the src object if target is null', () => {
        const src = { prop1: 'blah', prop2: 4 };
        let target = null;
        target = deepAssign( target, src );
        expect(target).toEqual(src);
    });

    it( 'Should return null if the src is null', () => {
        const src = null;
        let target = { prop1: 'blah', prop2: 4 };
        target = deepAssign( target, src );
        expect(target).toBe(null);
    });

    it( 'Should return undefined if the src is undefined', () => {
        const src = undefined;
        let target = { prop1: 'blah', prop2: 4 };
        target = deepAssign( target, src );
        expect(target).toBe(undefined);
    });

    it( 'Should copy src values into the target and return the target for shallow objects', () => {
        const src = { prop1: 'blah', prop2: 4 };
        let target = {};
        target = deepAssign( target, src );
        expect(target).toEqual(src);
        expect(target).not.toBe(src);
    });

    it( 'Should copy src values into the target and return the target for deep objects', () => {
        const src = { prop1: 'blah', prop2: { subProp1: 'a'} };
        let target = {};
        target = deepAssign( target, src );
        expect(target).toEqual(src);
        expect(target).not.toBe(src);
    });

    it( 'Should copy src values into the target and return the target for deep objects and remove extra props from target', () => {
        const src: any= { prop1: 'blah', prop2: { subProp1: 'a'} };
        let target: any = { prop3: 'blah', prop2: { subProp2: 'b'}};
        target = deepAssign( target, src );
        expect(target).toEqual(src);
        expect(target).not.toBe(src);
    });

    it( 'Should copy src values into the target and return the target for lists', () => {
        const src = [1, 2, 3, 4];
        let target = [];
        target = deepAssign( target, src );
        expect(target).toEqual(src);
        expect(target).not.toBe(src);
    });

    it( 'Should copy src values into the target and return the target for lists and remove extra entries', () => {
        const src = [1, 2, 3, 4];
        let target = [5, 6, 7, 8, 9];
        target = deepAssign( target, src );
        expect(target).toEqual(src);
        expect(target).not.toBe(src);
    });

    it( 'Should copy src values into the target and return the target for lists with objects', () => {
        const src = [{prop1: 'a'}, {prop1: 'b'}];
        let target = [];
        target = deepAssign( target, src );
        expect(target).toEqual(src);
        expect(target).not.toBe(src);
    });

    it( 'Should copy src values into the target and return the target for lists with objects adn remove extra entries', () => {
        const src:any = [{prop1: 'a'}, {prop1: 'b'}];
        let target:any = [{prop1: 'a', prop2: 'a'}];
        target = deepAssign( target, src );
        expect(target).toEqual(src);
        expect(target).not.toBe(src);
    });

    it( 'Should create new array instances when missing on target', () => {
        const src:any = {prop1: ['a', 'b' , 'c']};
        let target:any = {prop2: {'foo': 'bar'}};
        target = deepAssign(target, src);
        expect(target.prop1).toEqual(src.prop1);
        expect(target.prop1).not.toBe(src.prop1);
        expect(target.prop2).toBeUndefined();
    });

    it( 'Should create new object instances when missing on target', () => {
        const src:any = {prop1: {'cat': 'dog'}};
        let target:any = {prop2: {'foo': 'bar'}};
        target = deepAssign(target, src);
        expect(target.prop1).toEqual(src.prop1);
        expect(target.prop1).not.toBe(src.prop1);
        expect(target.prop2).toBeUndefined();
    });

    it( 'Should create new object with array instances when missing on target', () => {
        const src:any = {prop1: {'cat': ['a', 'b']}};
        let target:any = {prop2: {'foo': 'bar'}};
        target = deepAssign(target, src);
        expect(target.prop1).toEqual(src.prop1);
        expect(target.prop1).not.toBe(src.prop1);
        expect(target.prop1.cat).toEqual(src.prop1.cat);
        expect(target.prop1.cat).not.toBe(src.prop1.cat);
        expect(target.prop2).toBeUndefined();
    });

    it( 'Should not copy functions to target', () => {
        const src:any = {prop1: {'foo': 'bar'}, fun: () => { return true }};
        let target: any = {prop1: {'bar': 'foo'}};
        target = deepAssign(target, src);
        expect(target.prop1).toEqual(src.prop1);
        expect(target.prop1).not.toBe(src.prop1);
        expect(target.prop2).toBeUndefined();
    });
});
