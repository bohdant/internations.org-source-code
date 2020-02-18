/* @flow */
import * as React from 'react'
import ListOfItems from 'app/components/presentational/ListOfItems'

const ProductItem = ({
    product,
    active,
    onClick,
    className,
}: {
    active: boolean,
    onClick: Function,
    product: Object,
    className: string,
}) => {
    const testClass = className

    return (
        <div onClick={onClick} className={`${testClass} productSelection__item ${active ? 'is-active' : ''}`}>
            <div className="u-flexAlignCenter u-spaceLeft">
                <ProductItemRadio active={active} />
                <div className="productSelection__subscriptionPeriod">{`${product.timePeriod} months`}</div>
            </div>
            <div className="u-spaceRight">{product.price} / month</div>
        </div>
    )
}

const ProductItemRadio = ({ active }: { active: boolean }) => {
    const iconClass = active ? null : 'is-hidden'

    return (
        <div className="productSelection__radio">
            <div className={iconClass}>
                <i className="icon icon-tick-green" />
            </div>
        </div>
    )
}

type Props = {
    fieldName?: string,
    productList: Object[],
    selectedProduct?: string,
}

type State = {
    fieldName?: string,
    selectedProduct?: string,
}

class ProductTable extends React.PureComponent<Props, State> {
    constructor(props: Object) {
        super(props)
        this.state = {
            selectedProduct: this.props.selectedProduct
                ? this.props.selectedProduct
                : this.props.productList[this.props.productList.length - 1].value,
            fieldName: this.props.fieldName,
        }
    }

    onProductClick(product: Object) {
        this.setState({
            selectedProduct: product.value,
        })
    }

    render() {
        const products = this.props.productList.map((product, i) => (
            <ProductItem
                key={product.price}
                className={`t-product-selection-item-${i + 1}`}
                product={product}
                active={this.state.selectedProduct === product.value}
                onClick={() => this.onProductClick(product)}
            />
        ))

        products.push(
            <input
                key={this.state.fieldName}
                type="hidden"
                name={this.state.fieldName}
                value={this.state.selectedProduct}
            />
        )

        return (
            <ListOfItems>
                <div className="t-productSelection">{products}</div>
            </ListOfItems>
        )
    }
}

export default ProductTable
