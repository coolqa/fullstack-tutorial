import React, { Fragment } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { LaunchTile, Header, Button, Loading } from '../components'

const GET_LAUNCHES = gql`
  query launchList($after: String) {
    launches(pageSize: 3, after: $after) {
      cursor
      hasMore
      launches {
        id
        isBooked
        rocket {
          id
          name
        }
        mission {
          name
          missionPatch
        }
      }
    }
  }
`

export default function Launches() {
  const onLoadMore = (fetchMore, cursor) => () =>
    fetchMore({
      variables: {
        after: cursor,
      },
      updateQuery: (prev, { fetchMoreResult, ...rest }) => {
        if (!fetchMoreResult) return prev
        // TODO: can probably abstract this to something nicer
        return {
          ...fetchMoreResult,
          launches: {
            ...fetchMoreResult.launches,
            launches: [
              ...prev.launches.launches,
              ...fetchMoreResult.launches.launches,
            ]
          }
        }
      }
    })

  return (
    <Query query={GET_LAUNCHES}>
      {({ data, loading, error, fetchMore }) => {
        if (loading) return <Loading />
        if (error) return <p>ERROR</p>

        return (
          <Fragment>
            <Header />
            {data.launches &&
              data.launches.launches &&
              data.launches.launches.map(launch => (
                <LaunchTile
                  key={launch.id}
                  launch={launch}
                />
              ))}
              {data.launches &&
                data.launches.hasMore && (
                  <Button
                    onClick={onLoadMore(fetchMore, data.launches.cursor)}
                  >
                    Load More
                  </Button>
                )
              }
          </Fragment>
        )
      }}
    </Query>
  )
}
