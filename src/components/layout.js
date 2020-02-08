import React from 'react'
import { Link } from 'gatsby'

import { rhythm, scale } from '../utils/typography'

const Layout = ({ location, title, children }) => {
	const rootPath = `${__PATH_PREFIX__}/`

	let header = location.pathname === rootPath
		? <h1
			style={{
				...scale(1.5),
				marginBottom: rhythm(1.5),
				marginTop: 0,
			}}
		>
			{title}
		</h1>
		: <h3
			style={{
				marginTop: 0,
			}}
		>
			<Link to={`/`}>
				{title}
			</Link>
		</h3>

	return (
		<div
			style={{
				marginLeft: `auto`,
				marginRight: `auto`,
				maxWidth: rhythm(30),
				padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
			}}
		>
			<header>{header}</header>
			<main>{children}</main>

			<footer>
				<div style={{ float: 'right' }}>
					<a href="/rss.xml" target="_blank" rel="noopener noreferrer">
						rss
					</a>
				</div>

				© {new Date().getFullYear()}, Built with
				{` `}
				<a href="https://www.gatsbyjs.org">Gatsby</a>
			</footer>
		</div>
	)
}

export default Layout
