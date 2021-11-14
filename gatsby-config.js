module.exports = {
	siteMetadata: {
		title: `Quinn's Blog`,
		author: `Quinn Shanahan`,
		description: `It's probably gonna mostly be about code`,
		siteUrl: `https://quinn.io/`,
		social: {
			twitter: `quinnshanahan`,
			github: `quinn`,
			instagram: `qshan`,
		},
	},

	plugins: [
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: `${__dirname}/content/blog`,
				name: `blog`,
			},
		},

		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: `${__dirname}/content/assets`,
				name: `assets`,
			},
		},

		{
			resolve: `gatsby-transformer-remark`,
			options: {
				plugins: [
					{
						resolve: `gatsby-remark-images`,
						options: {
							maxWidth: 590,
						},
					},
					{
						resolve: `gatsby-remark-responsive-iframe`,
						options: {
							wrapperStyle: `margin-bottom: 1.0725rem`,
						},
					},
					`gatsby-remark-prismjs`,
					`gatsby-remark-copy-linked-files`,
					`gatsby-remark-smartypants`,
				],
			},
		},

		`gatsby-transformer-sharp`,
		`gatsby-plugin-sharp`,

		{
			resolve: `gatsby-plugin-google-analytics`,
			options: {
				trackingId: process.env.GA_TRACKING_ID || 'local',
			},
		},

		{
			resolve: `gatsby-plugin-feed`,
			options: {
				query: `
					{
						site {
							siteMetadata {
							title
							description
							siteUrl
							site_url: siteUrl
							}
						}
					}
				`,
				feeds: [
					{
						serialize: ({ query: { site, allMarkdownRemark } }) => {
							return allMarkdownRemark.nodes.map(node => {
								return Object.assign({}, node.frontmatter, {
									description: node.excerpt,
									date: node.frontmatter.date,
									url: site.siteMetadata.siteUrl + node.fields.slug,
									guid: site.siteMetadata.siteUrl + node.fields.slug,
									custom_elements: [{ "content:encoded": node.html }],
								})
							})
						},
						query: `
							{
								allMarkdownRemark(
									sort: { order: DESC, fields: [frontmatter___date] },
								) {
									nodes {
										excerpt
										html
										fields { 
											slug 
										}
										frontmatter {
											title
											date
										}
									}
								}
							}
						`,
						output: "/rss.xml",
						title: "Your Site's RSS Feed",
					},
				],
			},
		},

		{
			resolve: `gatsby-plugin-manifest`,
			options: {
				name: `Quinn's Blog`,
				short_name: `quinns-blog`,
				start_url: `/`,
				background_color: `#ffffff`,
				theme_color: `#663399`,
				display: `minimal-ui`,
				icon: `content/assets/favicon.png`,
			},
		},

		`gatsby-plugin-react-helmet`,

		{
			resolve: `gatsby-plugin-typography`,
			options: {
				pathToConfigModule: `src/utils/typography`,
			},
		},

		// this (optional) plugin enables Progressive Web App + Offline functionality
		// To learn more, visit: https://gatsby.dev/offline
		// `gatsby-plugin-offline`,
	],
}
