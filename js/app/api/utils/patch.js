import io from 'service/io'

export default function patch({ url, data }) {
    return io.ajax({
        url,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        type: 'PATCH',
    })
}
