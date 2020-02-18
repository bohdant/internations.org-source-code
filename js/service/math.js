// Math functions

export function fibonacci(n) {
    let a = 1
    let b = 0
    let temp

    while (n > 0) {
        temp = a
        a += b
        b = temp
        n -= 1
    }

    return b
}
